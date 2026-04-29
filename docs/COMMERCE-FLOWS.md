# Commerce Flows

Last updated: 2026-04-29

This document captures the current checkout, payment, post-purchase upsell, and account behavior implemented in the local stack.

## Ownership

- **Medusa** owns commerce state: carts, customers, orders, payments, prices, PPU rules, and PPU order state.
- **Nuxt** owns storefront orchestration: checkout UI, Braintree Hosted Fields, post-purchase upsell page, account page, and server-side BFF routes.
- **Strapi** owns editorial PDP/page content only. It does not own prices, payment, customer, order, or PPU rule data.

## Braintree Checkout

Braintree is implemented as a custom Medusa v2 payment provider in:

- `apps/commerce/src/modules/braintree-payment`
- `apps/commerce/src/api/store/braintree/client-token/route.ts`
- `apps/commerce/src/admin/routes/settings/braintree/page.tsx`

The storefront initializes Hosted Fields from `/api/checkout/braintree-client-token`, then sends the nonce to `/api/checkout/complete`.

Current payment behavior:

- Checkout payments are submitted for settlement immediately.
- `BRAINTREE_SUBMIT_FOR_SETTLEMENT=true` is the expected default.
- The provider vaults the payment method during checkout and stores:
  - `payment_method_token`
  - `braintree_customer_id`
  - card type / last 4
  - original Braintree `transaction_id`
- PPU payments charge the saved Braintree token.

Important local env values:

```env
BRAINTREE_ENABLED=true
BRAINTREE_ENVIRONMENT=sandbox
BRAINTREE_MERCHANT_ID=
BRAINTREE_PUBLIC_KEY=
BRAINTREE_PRIVATE_KEY=
BRAINTREE_MERCHANT_ACCOUNT_ID=
BRAINTREE_SUBMIT_FOR_SETTLEMENT=true
```

## Checkout Completion

Storefront route:

- `apps/storefront/server/api/checkout/complete.post.ts`

Flow:

1. Validate cart, provider ID, and Braintree nonce.
2. Update cart email, billing address, and shipping address.
3. Add default shipping method if the cart has none.
4. Create payment collection/session with Braintree nonce and customer data.
5. Complete the Medusa cart.
6. Create/login the storefront account session for the checkout email.
7. Evaluate PPU eligibility.
8. Redirect to `/post-purchase-upsell` when eligible, otherwise `/thank-you-order`.

## Post-Purchase Upsell

PPU is Medusa-owned. Strapi is not involved.

Main files:

- `apps/commerce/src/lib/ppu.ts`
- `apps/commerce/src/api/store/ppu/orders/[id]/evaluate/route.ts`
- `apps/commerce/src/api/store/ppu/orders/[id]/offer/route.ts`
- `apps/commerce/src/api/store/ppu/orders/[id]/accept/route.ts`
- `apps/commerce/src/api/store/ppu/orders/[id]/skip/route.ts`
- `apps/commerce/src/api/admin/ppu-rules/route.ts`
- `apps/commerce/src/admin/routes/settings/ppu/page.tsx`
- `apps/commerce/src/admin/components/VariantAutocomplete.tsx`
- `apps/storefront/pages/post-purchase-upsell.vue`
- `apps/storefront/server/api/ppu/[orderId]/*`

Tables are created lazily by `ensurePpuTables()`:

- `ppu_rule`
- `ppu_order_offer`

PPU rule fields:

- rule name
- status: `draft` or `active`
- priority
- trigger variant IDs
- excluded variant IDs
- offer variant ID
- special price
- max accepts
- offer copy fields:
  - eyebrow
  - title
  - description
  - price label
  - accept button
  - skip button

Admin setup:

- Go to `http://localhost:9000/app/settings/ppu`.
- Use the searchable product pickers for trigger products, excluded products, and offer product.
- Same-product PPU is allowed. Use **Excluded products** only when a product should block the offer.

Storefront flow:

1. Checkout completes.
2. Eligible order is marked with:
   - `metadata.ppu_status = "on_hold"`
   - `metadata.ppu_release_at`
   - `metadata.ppu_current_rule_id`
3. Customer sees `/post-purchase-upsell`.
4. Accept:
   - charges saved Braintree token
   - adds upsell item to same order
   - records `order_transaction` with `reference = "braintree_ppu"`
   - marks PPU offer `accepted`
   - marks order metadata `ppu_status = "processed"`
5. Skip:
   - marks offer skipped
   - marks order metadata `ppu_status = "processed"`
6. Timeout:
   - scheduled job releases stale held orders.

PPU accept is idempotency-aware:

- If Braintree succeeds but appending the order item fails, the Braintree transaction ID is saved on `ppu_order_offer` as `charged`.
- Retrying accept reuses the saved transaction and should not charge again.

## Account Page

Storefront page:

- `apps/storefront/pages/account.vue`

Storefront account API:

- `apps/storefront/server/api/account/login.post.ts`
- `apps/storefront/server/api/account/register.post.ts`
- `apps/storefront/server/api/account/logout.post.ts`
- `apps/storefront/server/api/account/me.get.ts`
- `apps/storefront/server/api/account/admin-test.post.ts`

Commerce account helpers/routes:

- `apps/commerce/src/lib/account-session.ts`
- `apps/commerce/src/api/store/account/orders/route.ts`
- `apps/commerce/src/api/store/account/checkout-session/route.ts`
- `apps/commerce/src/api/store/account/dev-admin-session/route.ts`

Current behavior:

- `/account` supports sign in, create account, sign out, and previous order history.
- Customer token is stored in an httpOnly cookie named `particle_customer_token`.
- After checkout, Nuxt calls `/store/account/checkout-session` to create/use a customer session for the checkout email.
- Order history is loaded by authenticated customer email so previous guest orders for that email are visible.
- In local dev, `/account` auto-creates/uses a customer session for `MEDUSA_ADMIN_EMAIL` via `admin-test`, so admins can test account behavior without a separate customer login.

Security note:

- The admin-test bridge is disabled in production by checking `NODE_ENV === "production"`.

## Testing Checklist

For checkout + PPU:

1. Create/update an active PPU rule in Medusa Admin.
2. Buy the trigger product on the storefront.
3. Confirm Braintree original transaction is submitted for settlement.
4. Confirm redirect to `/post-purchase-upsell`.
5. Accept the offer.
6. Confirm Braintree PPU transaction is submitted for settlement.
7. Confirm Medusa order contains the original item and PPU item.
8. Confirm `ppu_order_offer.status = accepted`.
9. Confirm order metadata has `ppu_status = processed`.
10. Visit `/account` and confirm the order appears.

Useful SQL:

```sql
select id, name, status, trigger_variant_ids, offer_variant_id, special_price
from ppu_rule
order by created_at desc;

select *
from ppu_order_offer
order by updated_at desc;

select reference, reference_id, amount, currency_code, created_at
from order_transaction
order by created_at desc;
```

## Known Follow-Ups

- Medusa `payment_collection.status` may still show `authorized` even when Braintree has `submitted_for_settlement`; sync/capture state should be normalized.
- PPU order item insertion currently writes directly to Medusa order tables. Longer term, replace with official Medusa order-edit/order-change workflow if a stable workflow is available for this case.
- Add delete/duplicate controls for PPU rules in Admin.
- Add richer PPU offer layout/content controls after the MVP flow stabilizes.
