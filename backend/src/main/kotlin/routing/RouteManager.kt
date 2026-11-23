package org.chatter.routing

import io.ktor.server.routing.Route
import org.chatter.routing.routes.authRoutes

fun Route.registerRoutes() {
    authRoutes()
    // messageRoutes()
}
