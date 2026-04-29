import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '..')
const scrapeHtmlDir = process.env.SCRAPE_HTML_DIR
  ? path.resolve(process.env.SCRAPE_HTML_DIR)
  : path.resolve(root, '..', '..', 'Cursor Projects', 'particleformen-scrape', 'output', 'html')

const quoteSql = (value) => `'${String(value).replace(/'/g, "''")}'`
const priceId = (handle, quantity) => {
  return `price_tier_scraped_usd_${handle.replace(/[^a-z0-9]+/g, '_')}_${quantity}`.slice(0, 190)
}

const extractTierPrices = (html) => {
  const buttonMatches = html.matchAll(/<button\b(?=[^>]*data-qty=)[\s\S]*?<\/button>/g)
  const tiers = new Map()

  for (const match of buttonMatches) {
    const buttonHtml = match[0]
    const quantity = Number(buttonHtml.match(/data-qty="(\d+)"/)?.[1] || 0)

    if (!quantity) {
      continue
    }

    let unitPrice = Number(buttonHtml.match(/data-unit-price="(\d+(?:\.\d+)?)"/)?.[1] || 0)
    const totalText = buttonHtml.match(/(?:products-total|th-products__total)[\s\S]*?\$\s*([\d,.]+)/)?.[1]

    if (!unitPrice && totalText) {
      unitPrice = Number((Number(totalText.replace(/,/g, '')) / quantity).toFixed(2))
    }

    if (unitPrice) {
      tiers.set(quantity, unitPrice)
    }
  }

  return tiers
}

if (!fs.existsSync(scrapeHtmlDir)) {
  throw new Error(`Scraped HTML directory was not found: ${scrapeHtmlDir}`)
}

const tiersByHandle = new Map()

for (const fileName of fs.readdirSync(scrapeHtmlDir)) {
  if (!/^product-.*\.html$/.test(fileName)) {
    continue
  }

  const handle = fileName
    .replace(/^product-/, '')
    .replace(/\.html$/, '')
    .replace(/-cart-drawer-open$/, '')
  const html = fs.readFileSync(path.join(scrapeHtmlDir, fileName), 'utf8')
  const tiers = extractTierPrices(html)

  if (!tiers.size) {
    continue
  }

  const existing = tiersByHandle.get(handle) || new Map()
  for (const [quantity, unitPrice] of tiers) {
    existing.set(quantity, unitPrice)
  }
  tiersByHandle.set(handle, existing)
}

let sql = `begin;
delete from price where id like 'price_tier_scraped_usd_%' or id like 'price_tier_face_cream_usd_%';
`

for (const [handle, tiers] of tiersByHandle) {
  if (tiers.has(1)) {
    const unitPrice = tiers.get(1)
    sql += `
update price pr
set
  amount = ${unitPrice},
  raw_amount = jsonb_build_object('value', '${unitPrice}', 'precision', 20),
  updated_at = now()
from product p
join product_variant v on v.product_id = p.id
join product_variant_price_set pv on pv.variant_id = v.id
where p.handle = ${quoteSql(handle)}
  and p.deleted_at is null
  and v.deleted_at is null
  and pr.price_set_id = pv.price_set_id
  and pr.currency_code = 'usd'
  and pr.min_quantity is null
  and pr.price_list_id is null
  and pr.deleted_at is null;
`
  }

  for (const [quantity, unitPrice] of [...tiers].sort((a, b) => a[0] - b[0])) {
    if (quantity <= 1) {
      continue
    }

    sql += `
insert into price (
  id,
  price_set_id,
  currency_code,
  amount,
  raw_amount,
  min_quantity,
  raw_min_quantity,
  rules_count,
  created_at,
  updated_at
)
select
  ${quoteSql(priceId(handle, quantity))},
  pv.price_set_id,
  'usd',
  ${unitPrice},
  jsonb_build_object('value', '${unitPrice}', 'precision', 20),
  ${quantity},
  jsonb_build_object('value', '${quantity}', 'precision', 20),
  0,
  now(),
  now()
from product p
join product_variant v on v.product_id = p.id
join product_variant_price_set pv on pv.variant_id = v.id
where p.handle = ${quoteSql(handle)}
  and p.deleted_at is null
  and v.deleted_at is null
on conflict (id) do update
set
  amount = excluded.amount,
  raw_amount = excluded.raw_amount,
  min_quantity = excluded.min_quantity,
  raw_min_quantity = excluded.raw_min_quantity,
  updated_at = now();
`
  }
}

sql += `commit;
`

const result = spawnSync('docker', [
  'compose',
  'exec',
  '-T',
  'postgres-commerce',
  'psql',
  '-U',
  'medusa',
  '-d',
  'medusa_db',
], {
  cwd: root,
  input: sql,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
})

if (result.status !== 0) {
  process.stderr.write(result.stderr)
  process.stdout.write(result.stdout)
  process.exit(result.status || 1)
}

process.stdout.write(result.stdout)
console.log(`Applied quantity pricing for ${tiersByHandle.size} products.`)
for (const [handle, tiers] of tiersByHandle) {
  console.log(`${handle}: ${[...tiers].sort((a, b) => a[0] - b[0]).map(([quantity, price]) => `${quantity}+=$${price}`).join(', ')}`)
}
