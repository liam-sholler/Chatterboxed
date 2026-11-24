package org.chatter.services

object Services {
    fun initAll() {
        Service::class.sealedSubclasses.forEach { subclass ->
            val service = subclass.objectInstance
                ?: error("${subclass.simpleName} must be an `object` to implement Service")
            service.init()
        }
    }
}