package org.chatter

import io.github.cdimascio.dotenv.Dotenv
import java.nio.file.Files
import java.nio.file.Path
import io.ktor.server.application.*

private fun loadEnv(): Map<String, String> {
    val cwd = Path.of("").toAbsolutePath().normalize()
    val dirs = listOfNotNull(cwd, cwd.parent)
    val values = mutableMapOf<String, String>()

    // Later files override earlier ones, matching Vite's order.
    for (name in listOf(".env", ".env.local")) {
        val dir = dirs.firstOrNull { Files.isRegularFile(it.resolve(name)) } ?: continue
        Dotenv.configure()
            .directory(dir.toString())
            .filename(name)
            .load()
            .entries(Dotenv.Filter.DECLARED_IN_ENV_FILE) // don't accidentally grab from system env
            .forEach { values[it.key] = it.value }
    }
    return values
}

object Constants {
    const val PROJECT_TITLE = "Chatterboxed"
    var SHARED_SERVER_PORT: Int = 8080
    var FRONTEND_URLS: List<String> = emptyList()

    fun parse() {
        val file = loadEnv()
        fun get(key: String): String? = System.getenv(key) ?: file[key] // real env wins

        SHARED_SERVER_PORT = get("SHARED_SERVER_PORT")?.toIntOrNull()
            ?: error("SHARED_SERVER_PORT missing or not a number")
        FRONTEND_URLS = get("FRONTEND_URLS").orEmpty()
            .split(",").map { it.trim() }.filter { it.isNotEmpty() }
    }
}
