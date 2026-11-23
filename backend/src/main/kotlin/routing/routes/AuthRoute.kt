package org.chatter.routing.routes

import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route

fun Route.authRoutes() {
    route("/auth") {
        post("/register") {
            // Register a user.
        }

        post("/login") {
            // Check username + password and issue a challengeId (ID stays valid for 60s, used for keeping track of user logging in).
        }

        post("/logout") {
            // Logs a user out of their currently logged-in account.
        }


        post("/verify-mfa") {
            // Authenticate a user and issue a token.
        }

        post("/auth/me") {
            // Takes in the user's auth cookie and returns their identity
        }
    }
}