plugins {
    application
    kotlin("jvm") version "2.4.21"
    kotlin("plugin.serialization") version "2.3.20"
    id("io.ktor.plugin") version "3.4.2"
}

application {
    mainClass.set("org.chatter.ApplicationKt")
}

group = "org.chatter"
version = "0.1.0"

repositories {
    mavenCentral()
}

val ktorVersion = "3.6.1"

dependencies {
    testImplementation(kotlin("test"))

    /* Utility */

    implementation("ch.qos.logback:logback-classic:1.5.32")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
    implementation("org.jobrunr:jobrunr:9.0.5")
    implementation("org.jobrunr:jobrunr-kotlin-support:9.0.5")

    /* Ktor */

    implementation("io.ktor:ktor-server-websockets:${ktorVersion}")
    implementation("io.ktor:ktor-server-netty:${ktorVersion}")
    implementation("io.ktor:ktor-server-rate-limit:${ktorVersion}")
    implementation("io.ktor:ktor-server-cors:${ktorVersion}")
    implementation("io.ktor:ktor-server-content-negotiation:${ktorVersion}")
    implementation("io.ktor:ktor-serialization-kotlinx-json:${ktorVersion}")
    implementation("io.ktor:ktor-server-status-pages:${ktorVersion}")

    // Tests
    testImplementation("io.ktor:ktor-server-test-host:${ktorVersion}")
    testImplementation("io.ktor:ktor-client-content-negotiation:${ktorVersion}")

    /* Authentication & Security */

    implementation("com.password4j:password4j:1.8.4")
    implementation("dev.turingcomplete:kotlin-onetimepassword:3.0.0")
    implementation("io.github.cdimascio:dotenv-kotlin:6.5.1")
    implementation("dev.whyoleg.cryptography:cryptography-core:0.6.0")
    implementation("dev.whyoleg.cryptography:cryptography-provider-optimal:0.6.0")

    /* Database */

    // Exposed
    implementation("org.jetbrains.exposed:exposed-core:1.6.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:1.6.1")
    implementation("org.jetbrains.exposed:exposed-java-time:1.6.1") // date/timestamp columns

    // Driver + connection pool
    implementation("org.postgresql:postgresql:42.7.12")
    implementation("com.zaxxer:HikariCP:7.1.0")

    // Logging (Hikari and Exposed both log through SLF4J)
    implementation("ch.qos.logback:logback-classic:1.5.20")

    // Testing
    testImplementation(kotlin("test"))
    testImplementation("org.testcontainers:testcontainers-postgresql:2.0.5")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter:2.0.5")
}

tasks.test { useJUnitPlatform() }

kotlin {
    jvmToolchain(21)
}

tasks.test {
    useJUnitPlatform()
}