package org.chatter.routing

import io.ktor.server.plugins.ratelimit.RateLimitName
import io.ktor.server.plugins.ratelimit.rateLimit
import io.ktor.server.request.receive
import io.ktor.server.routing.Route
import io.ktor.server.routing.RoutingContext
import io.ktor.server.routing.post
import kotlinx.serialization.Serializable

inline fun <reified T : Any> Route.limitedPost(
    path: String,
    limit: RateLimitName,
    crossinline body: suspend RoutingContext.(T) -> Unit,
) {
    rateLimit(limit) {
        post(path) {
            val request = call.receive<T>()
            body(request)
        }
    }
}

@Serializable
enum class ApiErrorCode {
    USERNAME_TAKEN,
    INVALID_USERNAME,
    INVALID_PASSWORD,
    REGISTRATION_EXPIRED,
    INVALID_MFA_CODE,
    MALFORMED,
    INTERNAL_ERROR,
}

enum class CredentialType(
    val invalidErrorCode: ApiErrorCode,
    val invalidMessage: String,
) {
    USERNAME(
        ApiErrorCode.INVALID_USERNAME,
        "Username is invalid. Try another one.",
    ),
    PASSWORD(
        ApiErrorCode.INVALID_PASSWORD,
        "Password is invalid. Try another one.",
    ),
}

@Serializable
data class ApiError(
    val code: ApiErrorCode,
    val message: String,
) {
    companion object {
        fun usernameTaken() = ApiError(
            code = ApiErrorCode.USERNAME_TAKEN,
            message = "Username is taken. Try another one.",
        )

        fun badUserField(type: CredentialType) = ApiError(
            code = type.invalidErrorCode,
            message = type.invalidMessage,
        )

        fun malformed() = ApiError(
            code = ApiErrorCode.MALFORMED,
            message = "Your request is malformed."
        )

        fun wrongMfa() = ApiError(
            code = ApiErrorCode.INVALID_MFA_CODE,
            message = "MFA is invalid or code expired."
        )

        fun oldChallenge() = ApiError(
            code = ApiErrorCode.REGISTRATION_EXPIRED,
            message = "Registration timed out. Please log in or create your account again."
        )

    }
}
