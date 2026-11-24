package org.chatter.routing

import io.ktor.server.plugins.ratelimit.RateLimitConfig
import io.ktor.server.routing.Route
import org.chatter.routing.routes.*

fun Route.registerRoutes() {
    authRoutes()
    // messageRoutes()
}

fun RateLimitConfig.registerLimits() {
    authLimits()
    // messageLimits()
}