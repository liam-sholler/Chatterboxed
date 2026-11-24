package org.chatter.routing.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond
import kotlinx.serialization.Serializable
import org.chatter.routing.ApiError
import org.chatter.routing.CredentialType

private const val USERNAME_MIN = 3
private const val USERNAME_MAX = 10
private const val PASSWORD_MIN = 12

data class ValidRegisterRequest(
    val username: String,
    val password: String,
)

@Serializable
data class RegisterRequest(
    val username: String,
    val password: String,
) {
    suspend fun validate(call: ApplicationCall): Boolean {
        val invalidType = when {
            !isUsernameValid(username.trim()) -> CredentialType.USERNAME
            !isPasswordValid(password) -> CredentialType.PASSWORD
            else -> return true
        }

        call.respond(
            HttpStatusCode.BadRequest,
            ApiError.badUserField(invalidType),
        )
        return false
    }

    companion object {
        private val USERNAME_REGEX = Regex("^[a-zA-Z0-9_]+$")

        fun isUsernameValid(user: String): Boolean =
            user.length in USERNAME_MIN..USERNAME_MAX &&
                    USERNAME_REGEX.matches(user)

        fun isPasswordValid(pwd: String): Boolean =
            pwd.isNotBlank() && pwd.length >= PASSWORD_MIN
    }
}

@Serializable
data class MFARequest(
    val challengeId: String,
    val code: String,
) {
    suspend fun validate(call: ApplicationCall): Boolean {
        if (codeValid(code)) return true

        call.respond(
            HttpStatusCode.BadRequest,
            ApiError.malformed(),
        )
        return false
    }

    companion object {
        fun codeValid(code: String): Boolean =
            code.length == 6
    }
}


@Serializable
data class RegisterResponse(
    val challengeId: String,
    val secret: String,
)
