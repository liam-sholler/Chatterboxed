package org.chatter.services

import com.password4j.Hash
import com.password4j.Password
import dev.turingcomplete.kotlinonetimepassword.GoogleAuthenticator
import dev.whyoleg.cryptography.CryptographyProvider
import dev.whyoleg.cryptography.algorithms.SHA512
import dev.whyoleg.cryptography.operations.Hasher
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond
import org.chatter.Constants
import org.chatter.routing.ApiError
import org.chatter.routing.routes.MFARequest
import org.chatter.routing.routes.RegisterRequest
import org.chatter.routing.routes.RegisterResponse
import org.jobrunr.scheduling.BackgroundJob
import org.jobrunr.scheduling.cron.Cron
import java.util.concurrent.ConcurrentHashMap
import kotlin.time.Clock
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Instant

private data class PendingVerification(
    val username: String,
    val password: Hash?,
    val secret: ByteArray,
    val expiresAt: Instant,
)

object AuthService : Service {
    private val challenges: ConcurrentHashMap<String, PendingVerification> = ConcurrentHashMap()
    private val hasher: Hasher = CryptographyProvider.Default.get(SHA512).hasher()

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
            Password.hash(request.password).addRandomSalt(16).addPepper(Constants.PASSWORD_PEPPER).withScrypt(),
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

        // If remove returns false, another request already used it, so treat this one as a replay.
        if (!challenges.remove(request.challengeId, challenge)) {
            call.respond(HttpStatusCode.Unauthorized, ApiError.oldChallenge())
            return false
        }

        call.respond(HttpStatusCode.OK, "LGTM") // TODO: Return a `User` (get or create from DB. the user could in theory be taken by now, so we will have to handle an error later)
        return true
    }

    override fun init() {
        BackgroundJob.scheduleRecurrently("cleanup-old-mfa-challenges", Cron.every5minutes()) {
            challenges.values.removeIf { it.expiresAt < Clock.System.now() }
        }
    }
}