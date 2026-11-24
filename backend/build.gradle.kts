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

dependencies {
    testImplementation(kotlin("test"))
    implementation("ch.qos.logback:logback-classic:1.5.32")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
    implementation("io.ktor:ktor-server-websockets")
    implementation("io.ktor:ktor-server-netty")
    implementation("io.ktor:ktor-server-rate-limit")
    implementation("io.ktor:ktor-server-cors")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")
    implementation("io.ktor:ktor-server-status-pages")
    implementation("dev.whyoleg.cryptography:cryptography-core:0.6.0")
    implementation("dev.whyoleg.cryptography:cryptography-provider-optimal:0.6.0")
    implementation("dev.turingcomplete:kotlin-onetimepassword:3.0.0")
    implementation("io.github.cdimascio:dotenv-kotlin:6.5.1")
    implementation("org.jobrunr:jobrunr:9.0.5")
    implementation("org.jobrunr:jobrunr-kotlin-support:9.0.5")
}

kotlin {
    jvmToolchain(21)
}

tasks.test {
    useJUnitPlatform()
}