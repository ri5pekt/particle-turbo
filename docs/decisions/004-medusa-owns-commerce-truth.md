# ADR 004 — Medusa owns commerce truth

**Status:** Accepted

## Decision
Medusa is the single source of truth for all commerce data. No other system stores or derives commerce fields independently.

## Medusa-owned fields
- Products, variants, SKUs
- Prices (per region, per currency — independently set, not converted)
- Inventory and availability
- Promotions and discount codes
- Carts and line items
- Orders and order history
- Customers and addresses
- Regions and currencies
- Payment records
- Fulfillment records
- Subscriptions (via custom module)

## Consequences
- Strapi never stores prices, stock levels, or order data
- Nuxt never writes commerce data — it only reads and renders it
- All pricing logic lives in Medusa regions and price sets
