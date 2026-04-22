"use strict"

/**
 * Strapi Module — CommonJS entry point.
 *
 * Medusa's defineConfig calls require() on this module at startup (before the
 * TypeScript transpiler is registered) to extract the serviceName from __joinerConfig.
 * This file is therefore written in CommonJS so Node can load it unconditionally.
 *
 * At runtime the same file is used — the TypeScript .ts siblings are for IDE
 * type-checking only (TypeScript imports resolve to them; Node resolves to .js).
 */
const { Module } = require("@medusajs/framework/utils")
const StrapiModuleService = require("./service")

const STRAPI_MODULE = "strapi"

const definition = Module(STRAPI_MODULE, {
  service: StrapiModuleService,
})

module.exports = {
  ...definition,
  STRAPI_MODULE,
  default: definition,
}
