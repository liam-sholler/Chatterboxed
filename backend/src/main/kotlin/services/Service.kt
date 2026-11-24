package org.chatter.services

sealed interface Service {
    /** Called once at startup. */
    fun init() {}
}