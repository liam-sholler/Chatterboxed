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
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.request.uri
import io.ktor.utils.io.CancellationException

// Chatterbox
import org.chatter.routing.registerLimits
import org.chatter.routing.registerRoutes
import org.chatter.services.Services

// JobRunr
import org.jobrunr.configuration.JobRunr
import org.jobrunr.storage.InMemoryStorageProvider

fun main() {
    Constants.parse()
    JobRunr.configure()
        .useStorageProvider(InMemoryStorageProvider()) // TODO: Hook up to a DB
        .useBackgroundJobServer()
        .initialize()
    Services.initAll()

    embeddedServer(Netty, port = Constants.SHARED_SERVER_PORT, module = Application::module)
        .start(wait = true)
}

fun Application.module() {
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
        for (url in Constants.FRONTEND_URLS) {
            val uri = java.net.URI(url)
            val hostPort = if (uri.port != -1) "${uri.host}:${uri.port}" else uri.host
            allowHost(hostPort, schemes = listOf(uri.scheme))
        }

        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.ContentType)
        allowCredentials = true
    }

    install(StatusPages) {
        exception<BadRequestException> { call, _ ->
            call.respond(HttpStatusCode.BadRequest, "Invalid request")
        }
        exception<Throwable> { call, cause ->
            if (cause is CancellationException) throw cause
            println("Unhandled exception on ${call.request.uri}: ${cause.toString()}")
            call.respond(HttpStatusCode.InternalServerError, "Internal server error. Your request could not be completed. Try again?")
        }
    }

    routing {
        registerRoutes()

        post("/ping") {
            call.respond("pong")
        }
    }

    println("Server started on port ${Constants.SHARED_SERVER_PORT}")
}