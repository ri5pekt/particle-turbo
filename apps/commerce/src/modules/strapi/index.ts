/**
 * TypeScript re-export — used only by the TypeScript compiler for type-checking.
 * At runtime, Medusa loads index.js (CommonJS) which is the canonical implementation.
 */
import StrapiModuleService from "./service"

export const STRAPI_MODULE = "strapi"
export { StrapiModuleService }
