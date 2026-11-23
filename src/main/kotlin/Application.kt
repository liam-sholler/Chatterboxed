package org.chatter

// Kotlin
import kotlin.time.Duration.Companion.seconds

// Ktor WebSockets
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.server.response.*
import org.chatter.routing.registerRoutes

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    val port = environment.config.property("ktor.deployment.port").getString().toInt()

    println("${Constants.PROJECT_TITLE} starting up...")

    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 15.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    routing {
        registerRoutes()

        post("/ping") {
            call.respond("pong")
        }
    }

    print("Server started on port $port")
}