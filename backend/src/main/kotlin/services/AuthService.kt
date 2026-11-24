package org.chatter.services

import dev.turingcomplete.kotlinonetimepassword.GoogleAuthenticator
import dev.turingcomplete.kotlinonetimepassword.HmacAlgorithm
import dev.turingcomplete.kotlinonetimepassword.TimeBasedOneTimePasswordConfig
import dev.turingcomplete.kotlinonetimepassword.TimeBasedOneTimePasswordGenerator
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond
import org.chatter.routing.ApiError
import org.chatter.routing.routes.MFARequest
import org.chatter.routing.routes.RegisterRequest
import org.chatter.routing.routes.RegisterResponse
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import kotlin.time.Clock
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Instant

private data class PendingVerification(
    val username: String,
    val password: String,
    val secret: ByteArray,
    val expiresAt: Instant,
)

object AuthService {
    private val challenges: ConcurrentHashMap<String, PendingVerification> = ConcurrentHashMap()

    /**
     * Attempts to register a user to Chatterboxed. Automatically responds to the API call.
     *
     * @param request The in-flight registration request.
     * @param call The current API request.
     * @return A boolean corresponding to the result of registration.
     */
    suspend fun register(request: RegisterRequest, call: ApplicationCall): Boolean {
        // TODO: check if username is already registered in DB
        if (false) call.respond(HttpStatusCode.Conflict,ApiError.usernameTaken())

        val challengeId = GoogleAuthenticator.createSecureRandomSecretAsByteArray().decodeToString()
        val secret = GoogleAuthenticator.createSecureRandomSecretAsByteArray()

        challenges[challengeId] = PendingVerification(
            request.username,
            request.password,
            secret,
            Clock.System.now().plus(5.minutes)
        )

        call.respond(HttpStatusCode.OK,RegisterResponse(challengeId, secret.decodeToString()))
        return true
    }

    /**
     * Verifies an MFA code for an in-progress MFA request. Automatically responds to the API call.
     *
     * @param request The in-flight MFA validation request.
     * @param call The current API request.
     * @return A boolean corresponding to the result of MFA.
     */
    suspend fun verifyMfa(request: MFARequest, call: ApplicationCall): Boolean {
        val challenge: PendingVerification? = challenges[request.challengeId]
        if (challenge == null) {
            call.respond(HttpStatusCode.Unauthorized,ApiError.oldChallenge())
            return false
        }

        if (Clock.System.now() > challenge.expiresAt) {
            challenges.remove(request.challengeId, challenge)
            call.respond(HttpStatusCode.Unauthorized,ApiError.oldChallenge())
            return false
        }

        if (!GoogleAuthenticator(challenge.secret).isValid(request.code)) {
            call.respond(HttpStatusCode.Unauthorized, ApiError.wrongMfa())
            return false
        }

        call.respond(HttpStatusCode.OK,"LGTM") // TODO: Return a `User` (get or create from DB)
        return true
    }
}