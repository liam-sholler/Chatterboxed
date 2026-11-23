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
            // Authenticate a user and issue a token.
        }
    }
}