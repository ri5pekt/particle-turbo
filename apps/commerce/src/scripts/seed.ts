/**
 * Seed script — run with: pnpm --filter @particle-turbo/commerce db:seed
 *
 * Creates:
 *  - 8 Medusa regions covering all 11 locales from particleformen.com
 *  - 1 default sales channel
 *  - 1 sample product with per-region prices
 */
import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService = container.resolve(Modules.REGION)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const productService = container.resolve(Modules.PRODUCT)
  const pricingService = container.resolve(Modules.PRICING)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  // -------------------------------------------------------------------------
  // Regions
  // -------------------------------------------------------------------------
  const existingRegions = await regionService.listRegions()

  if (existingRegions.length > 0) {
    logger.info("[seed] Regions already exist — skipping region seed")
  } else {
    logger.info("[seed] Creating regions...")

    await regionService.createRegions([
      // Default — US is the default locale (no prefix in URL)
      {
        name: "United States",
        currency_code: "usd",
        countries: ["us"],
      },
      // gb → GBP
      {
        name: "United Kingdom",
        currency_code: "gbp",
        countries: ["gb"],
      },
      // au → AUD
      {
        name: "Australia",
        currency_code: "aud",
        countries: ["au"],
      },
      // ca → CAD
      {
        name: "Canada",
        currency_code: "cad",
        countries: ["ca"],
      },
      // es, fr, de, it → EUR (single EU region, multiple countries)
      {
        name: "European Union",
        currency_code: "eur",
        countries: ["es", "fr", "de", "it", "at", "be", "nl", "pt"],
      },
      // br → BRL
      {
        name: "Brazil",
        currency_code: "brl",
        countries: ["br"],
      },
      // ja → JPY
      {
        name: "Japan",
        currency_code: "jpy",
        countries: ["jp"],
      },
      // he → ILS (Hebrew = Israel)
      {
        name: "Israel",
        currency_code: "ils",
        countries: ["il"],
      },
    ])

    logger.info("[seed] Regions created ✓")
  }

  // -------------------------------------------------------------------------
  // Sales channel
  // -------------------------------------------------------------------------
  const existingChannels = await salesChannelService.listSalesChannels()
  let salesChannelId: string

  if (existingChannels.length > 0) {
    salesChannelId = existingChannels[0].id
    logger.info(`[seed] Using existing sales channel: ${salesChannelId}`)
  } else {
    logger.info("[seed] Creating default sales channel...")
    const [channel] = await salesChannelService.createSalesChannels([
      {
        name: "Default Sales Channel",
        description: "Main storefront channel",
        is_disabled: false,
      },
    ])
    salesChannelId = channel.id
    logger.info(`[seed] Sales channel created: ${salesChannelId}`)
  }

  // -------------------------------------------------------------------------
  // Seed product
  // -------------------------------------------------------------------------
  const existingProducts = await productService.listProducts({ handle: "sample-face-wash" })

  if (existingProducts.length > 0) {
    logger.info("[seed] Sample product already exists — skipping product seed")
  } else {
    logger.info("[seed] Creating sample product...")

    const [product] = await productService.createProducts([
      {
        title: "Particle Face Wash — Sample",
        handle: "sample-face-wash",
        description: "A lightweight, deep-cleansing face wash for men.",
        status: "published",
        options: [{ title: "Size", values: ["50ml", "100ml"] }],
        variants: [
          {
            title: "50ml",
            sku: "PFW-50ML",
            options: { Size: "50ml" },
            manage_inventory: false,
          },
          {
            title: "100ml",
            sku: "PFW-100ML",
            options: { Size: "100ml" },
            manage_inventory: false,
          },
        ],
      },
    ])

    // Create price sets and link to variants
    const regionList = await regionService.listRegions()

    const currencyPrices: Record<string, number> = {
      usd: 29,
      gbp: 23,
      aud: 44,
      cad: 39,
      eur: 27,
      brl: 149,
      jpy: 4400,
      ils: 109,
    }

    for (const variant of product.variants ?? []) {
      const baseAmount = variant.sku === "PFW-100ML" ? 49 : 29

      const priceSet = await pricingService.createPriceSets([
        {
          prices: regionList.map((region) => ({
            amount: Math.round(
              baseAmount * ((currencyPrices[region.currency_code] ?? 2900) / 2900)
            ),
            currency_code: region.currency_code,
            rules: { region_id: region.id },
          })),
        },
      ])

      await remoteLink.create([
        {
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.PRICING]: { price_set_id: priceSet[0].id },
        },
      ])
    }

    // Link product to sales channel
    await remoteLink.create([
      {
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      },
    ])

    logger.info(`[seed] Sample product created: ${product.id} ✓`)
  }

  logger.info("[seed] Done ✓")
}
