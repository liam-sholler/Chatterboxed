package org.chatter.routing.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.plugins.ratelimit.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import org.chatter.routing.ApiError
import org.chatter.routing.ApiErrorCode
import org.chatter.routing.CredentialType
import org.chatter.routing.limitedPost
import org.chatter.services.AuthService
import kotlin.time.Duration.Companion.seconds

object AuthLimits {
    val Register = RateLimitName("auth.register")
    val Login = RateLimitName("auth.login")
    val VerifyMFA = RateLimitName("auth.mfa-verify")
}

fun RateLimitConfig.authLimits() {
    register(AuthLimits.Register) { rateLimiter(limit = 5, refillPeriod = 60.seconds) }
    register(AuthLimits.Login) { rateLimiter(limit = 10, refillPeriod = 60.seconds) }
    register(AuthLimits.VerifyMFA) { rateLimiter(limit = 10, refillPeriod = 60.seconds) }
}

fun Route.authRoutes() {
    route("/auth") {
        limitedPost<RegisterRequest>(
            "/register",
            AuthLimits.Register,
        ) post@{ request ->
            if (!request.validate(call)) return@post
            AuthService.register(request, call)
        }

        post("/login") {
            // Check username + password and issue a challengeId (ID stays valid for 60s, used for keeping track of user logging in).
        }

        post("/logout") {
            // Logs a user out of their currently logged-in account.
        }

        limitedPost<MFARequest>(
            "/verify-mfa",
            AuthLimits.VerifyMFA,
        ) post@{ request ->
            if (!request.validate(call)) return@post
            AuthService.verifyMfa(request, call)
        }

        post("/auth/me") {
            // Takes in the user's auth cookie and returns their identity
        }
    }
}