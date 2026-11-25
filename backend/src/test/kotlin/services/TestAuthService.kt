package org.chatter.services

import dev.turingcomplete.kotlinonetimepassword.GoogleAuthenticator
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import io.ktor.server.testing.testApplication
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import org.chatter.routing.routes.MFARequest
import org.chatter.routing.routes.RegisterRequest
import org.chatter.routing.routes.RegisterResponse
import kotlin.random.Random
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlin.time.Clock
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds
import kotlin.time.Instant
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation as ClientContentNegotiation

/**
 * Black-box tests for AuthService: everything goes through HTTP, exactly like a real client
 * (or attacker) would see it. Nothing here inspects the challenge map, hashes, or other internals.
 */
class AuthServiceTest {

    private val clock = OffsetClock()

    @BeforeTest
    fun installClock() {
        AuthService.clock = clock
    }

    @AfterTest
    fun restoreClock() {
        AuthService.clock = Clock.System
    }

    // ---------------------------------------------------------------- happy path

    @Test
    fun `valid code completes registration`() = authTest {
        val enrollment = register()

        assertEquals(HttpStatusCode.OK, verify(enrollment.challengeId, enrollment.validCode()).status)
    }

    @Test
    fun `a single typo does not lock the user out`() = authTest {
        val enrollment = register()

        assertEquals(HttpStatusCode.Unauthorized, verify(enrollment.challengeId, enrollment.invalidCode()).status)
        assertEquals(HttpStatusCode.OK, verify(enrollment.challengeId, enrollment.validCode()).status)
    }

    // ---------------------------------------------------------------- replay

    @Test
    fun `a challenge cannot be completed twice with the same code`() = authTest {
        val enrollment = register()
        val code = enrollment.validCode()

        assertEquals(HttpStatusCode.OK, verify(enrollment.challengeId, code).status)
        assertEquals(HttpStatusCode.Unauthorized, verify(enrollment.challengeId, code).status)
    }

    @Test
    fun `a completed challenge cannot be reused even with a fresh code`() = authTest {
        val enrollment = register()

        assertEquals(HttpStatusCode.OK, verify(enrollment.challengeId, enrollment.validCode()).status)
        assertEquals(HttpStatusCode.Unauthorized, verify(enrollment.challengeId, enrollment.validCode()).status)
    }

    @Test
    fun `concurrent replays of a valid code succeed exactly once`() = authTest {
        val enrollment = register()
        val code = enrollment.validCode()

        val statuses = coroutineScope {
            List(25) { async { verify(enrollment.challengeId, code).status } }.awaitAll()
        }

        assertEquals(1, statuses.count { it == HttpStatusCode.OK }, "statuses were $statuses")
        assertTrue(statuses.all { it == HttpStatusCode.OK || it == HttpStatusCode.Unauthorized })
    }

    // ---------------------------------------------------------------- brute force

    @Test
    fun `challenge is invalidated after repeated wrong codes`() = authTest {
        // A 6-digit TOTP has 1,000,000 possibilities. With unlimited guesses over a 5-minute
        // window, an attacker can realistically brute-force it, so wrong guesses must be capped.
        val enrollment = register()

        repeat(MAX_WRONG_ATTEMPTS) {
            assertEquals(HttpStatusCode.Unauthorized, verify(enrollment.challengeId, enrollment.invalidCode()).status)
        }

        assertEquals(
            HttpStatusCode.Unauthorized,
            verify(enrollment.challengeId, enrollment.validCode()).status,
            "challenge should be burned after $MAX_WRONG_ATTEMPTS wrong codes",
        )
    }

    // ---------------------------------------------------------------- binding / lookup

    @Test
    fun `a code only works for the challenge it belongs to`() = authTest {
        val alice = register()
        val mallory = register()

        assertEquals(HttpStatusCode.Unauthorized, verify(alice.challengeId, mallory.validCode()).status)
        // Alice's own challenge must still be usable afterwards.
        assertEquals(HttpStatusCode.OK, verify(alice.challengeId, alice.validCode()).status)
    }

    @Test
    fun `unknown challenge id is rejected`() = authTest {
        assertEquals(HttpStatusCode.Unauthorized, verify("DOESNOTEXIST2345", "123456").status)
    }

    // ---------------------------------------------------------------- expiry

    @Test
    fun `challenge still works just before it expires`() = authTest {
        val enrollment = register()
        clock.advance(4.minutes + 55.seconds)

        assertEquals(HttpStatusCode.OK, verify(enrollment.challengeId, enrollment.validCode()).status)
    }

    @Test
    fun `expired challenge is rejected even with a valid code`() = authTest {
        val enrollment = register()
        clock.advance(5.minutes + 1.seconds)

        assertEquals(HttpStatusCode.Unauthorized, verify(enrollment.challengeId, enrollment.validCode()).status)
    }

    @Test
    fun `expired challenge stays dead if the clock goes backwards`() = authTest {
        val enrollment = register()
        clock.advance(5.minutes + 1.seconds)
        verify(enrollment.challengeId, enrollment.validCode())

        clock.advance((-10).minutes)

        assertEquals(HttpStatusCode.Unauthorized, verify(enrollment.challengeId, enrollment.validCode()).status)
    }

    // ---------------------------------------------------------------- hostile input

    @Test
    fun `malformed codes are rejected cleanly, never with a server error`() = authTest {
        val enrollment = register()
        val valid = enrollment.validCode()
        val malformed = listOf("", " ", "abcdef", "12345", "1234567", " $valid", "$valid\n", "$valid$valid", "9".repeat(10_000))

        for (code in malformed) {
            assertEquals(HttpStatusCode.Unauthorized, verify(enrollment.challengeId, code).status, "code=${code.take(20)}")
        }
    }

    @Test
    fun `hostile challenge ids are rejected cleanly`() = authTest {
        for (id in listOf("", " ", "../../etc/passwd", "' OR 1=1 --", "x".repeat(10_000))) {
            assertEquals(HttpStatusCode.Unauthorized, verify(id, "123456").status, "id=${id.take(20)}")
        }
    }

    // ---------------------------------------------------------------- registration output

    @Test
    fun `challenge ids and secrets are unique and not trivially guessable`() = authTest {
        // Each registration runs scrypt (deliberately slow), so keep this small.
        // 20 is still plenty to catch a constant or counter-based generator.
        val enrollments = List(20) { register() }

        assertEquals(enrollments.size, enrollments.map { it.challengeId }.toSet().size, "duplicate challenge ids")
        assertEquals(enrollments.size, enrollments.map { it.secret }.toSet().size, "duplicate secrets")
        assertTrue(enrollments.all { it.challengeId.length >= 16 }, "challenge ids are too short to resist guessing")
        assertTrue(enrollments.none { it.challengeId == it.secret }, "challenge id must not double as the TOTP secret")
    }

    @Test
    fun `registration response does not echo the password`() = authTest {
        val password = "hunter2-but-longer-${Random.nextInt()}"

        val body = registerRaw(uniqueUsername(), password).bodyAsText()

        assertFalse(body.contains(password), "password leaked in response: $body")
    }

    // ================================================================ harness

    private fun authTest(block: suspend Api.() -> Unit) = testApplication {
        // If you have an Application.module(), call that here instead and use your real paths.
        application { authTestModule() }
        val client = createClient { install(ClientContentNegotiation) { json() } }
        Api(client).block()
    }

    /** Minimal wiring so the tests exercise AuthService through real HTTP calls. */
    private fun Application.authTestModule() {
        install(ContentNegotiation) { json() }
        routing {
            post("/register") { AuthService.register(call.receive<RegisterRequest>(), call) }
            post("/mfa") { AuthService.verifyMfa(call.receive<MFARequest>(), call) }
        }
    }

    private class Api(private val client: HttpClient) {
        suspend fun registerRaw(username: String, password: String): HttpResponse =
            client.post("/register") {
                contentType(ContentType.Application.Json)
                setBody(RegisterRequest(username = username, password = password))
            }

        suspend fun register(
            username: String = uniqueUsername(),
            password: String = "correct horse battery staple",
        ): Enrollment {
            val response = registerRaw(username, password)
            assertEquals(HttpStatusCode.OK, response.status)
            val body = response.body<RegisterResponse>()
            return Enrollment(body.challengeId, body.secret)
        }

        suspend fun verify(challengeId: String, code: String): HttpResponse =
            client.post("/mfa") {
                contentType(ContentType.Application.Json)
                setBody(MFARequest(challengeId = challengeId, code = code))
            }
    }

    /** What a real user's authenticator app would hold after scanning the enrollment QR code. */
    private class Enrollment(val challengeId: String, val secret: String) {
        private val authenticator = GoogleAuthenticator(secret.encodeToByteArray())

        fun validCode(): String = authenticator.generate()

        fun invalidCode(): String =
            generateSequence { "%06d".format(Random.nextInt(1_000_000)) }.first { !authenticator.isValid(it) }
    }

    /** Real time plus an adjustable offset, so TOTP codes stay valid while challenge expiry moves. */
    private class OffsetClock : Clock {
        private var offset: Duration = Duration.ZERO
        override fun now(): Instant = Clock.System.now() + offset
        fun advance(by: Duration) {
            offset += by
        }
    }

    private companion object {
        const val MAX_WRONG_ATTEMPTS = 5
        fun uniqueUsername() = "user_${Random.nextLong().toULong()}"
    }
}
