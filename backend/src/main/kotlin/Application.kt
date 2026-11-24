package org.chatter

// Kotlin
import kotlin.time.Duration.Companion.seconds
import kotlinx.serialization.json.Json

// Ktor
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.server.response.*
import io.ktor.server.plugins.ratelimit.*
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json

// Chatterbox
import org.chatter.routing.registerLimits
import org.chatter.routing.registerRoutes

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    val port = environment.config.property("ktor.deployment.port").getString().toInt()

    println("${Constants.PROJECT_TITLE} starting up...")

    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }

    install(RateLimit) {
        registerLimits()
    }

    install(WebSockets) {
        pingPeriod = 15.seconds
        timeout = 15.seconds
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    install(CORS) {
        allowHost("localhost:5173") // TODO: Don't hardcode this

        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)

        allowCredentials = true
    }


    routing {
        registerRoutes()

        post("/ping") {
            call.respond("pong")
        }
    }

    println("Server started on port $port")
}