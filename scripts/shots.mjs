// Screenshot helper for visual checks: logs in with the admin from .env and captures routes.
// Usage:
//   node scripts/shots.mjs <outDir> [options] <route>...
//   node scripts/shots.mjs <outDir> --all [options]        every page in ROUTES
// Options: --dark | --themes=light,dark  --width=1440 | --widths=390,1024,1440  --no-login  --full
//          --eval=<js>  --base=<url>  --locale=en-US  --wait=800  --height=900  --channel=chrome
//          --axe   also run axe-core on each page and list serious and critical violations
import { readFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

// Every page of the console. Dynamic routes use the demo data set (useTestData), so seed it first.
// role: who has to be signed in; 'guest' pages are captured before the login.
const ROUTES = [
  { route: '/', role: 'guest', layout: 'auth' },
  { route: '/secured', role: 'admin', layout: 'default' },
  { route: '/secured/account', role: 'admin', layout: 'default' },
  { route: '/secured/admin/buckets', role: 'admin', layout: 'collection' },
  { route: '/secured/admin/overview', role: 'admin', layout: 'default' },
  { route: '/secured/admin/server', role: 'admin', layout: 'default' },
  { route: '/secured/admin/settings', role: 'admin', layout: 'default' },
  { route: '/secured/admin/databases', role: 'admin', layout: 'default' },
  { route: '/secured/admin/users', role: 'admin', layout: 'default' },
  { route: '/secured/admin/roles', role: 'admin', layout: 'default' },
  { route: '/secured/admin/roles/adminRole', role: 'admin', layout: 'default' },
  { route: '/secured/admin/permissions', role: 'admin', layout: 'default' },
  { route: '/secured/admin/jobs', role: 'admin', layout: 'default' },
  { route: '/secured/admin/collections', role: 'admin', layout: 'collection' },
  { route: '/secured/admin/collections/test_customer', role: 'admin', layout: 'collection' },
  { route: '/secured/admin/collections/test_customer/data', role: 'admin', layout: 'collection' },
  { route: '/secured/admin/collections/test_customer/aggregate', role: 'admin', layout: 'collection' },
  { route: '/secured/admin/buckets/test_images', role: 'admin', layout: 'collection' },
  { route: '/secured/does-not-exist', role: 'admin', layout: 'error' },
]

const args = process.argv.slice(2)
const outDir = args.shift()
const flags = args.filter(a => a.startsWith('--'))
const flag = name => flags.find(f => f === `--${name}` || f.startsWith(`--${name}=`))
const value = (name, fallback) => flag(name)?.split('=').slice(1).join('=') ?? fallback
const list = (name, fallback) => value(name, fallback).split(',').map(s => s.trim()).filter(Boolean)

if (!outDir || outDir.startsWith('--')) {
  console.log('usage: node scripts/shots.mjs <outDir> [--all] [options] <route>...')
  process.exit(1)
}

const login = !flag('no-login')
const targets = flag('all')
  ? ROUTES.filter(r => login || r.role === 'guest')
  : args.filter(a => !a.startsWith('--')).map(route => ({ route, role: login ? 'admin' : 'guest' }))

const env = Object.fromEntries(
  readFileSync(fileURLToPath(new URL('../.env', import.meta.url)), 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=')
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)

const base = value('base', 'http://localhost:3000')
const widths = list('widths', value('width', '1440')).map(Number)
const themes = list('themes', flag('dark') ? 'dark' : 'light')
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ channel: value('channel', 'chrome') })
const problems = new Map()

async function capture(page, route, suffix) {
  await page.goto(`${base}${route}`)
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(Number(value('wait', '800')))
  const name = `${route.replace(/[^\w]+/g, '_').replace(/^_|_$/g, '') || 'index'}-${suffix}.png`
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: Boolean(flag('full')) })
  console.log(`${route} -> ${outDir}/${name} (${page.url().replace(base, '')})`)
  const script = value('eval')
  if (script) console.log(JSON.stringify(await page.evaluate(script), null, 1))
  if (flag('axe')) await audit(page, route)
}

const axeSource = flag('axe') ? readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8') : ''

async function audit(page, route) {
  await page.addScriptTag({ content: axeSource })
  const violations = await page.evaluate(async () => {
    const result = await globalThis.axe.run(document, { resultTypes: ['violations'] })
    return result.violations
      .filter(v => v.impact === 'serious' || v.impact === 'critical')
      .map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.slice(0, 4).map(n => n.target.join(' ')), count: v.nodes.length }))
  })
  for (const v of violations) console.log(`  axe ${v.impact} ${v.id} (${v.count}) on ${route}: ${v.targets.join(' | ')}`)
}

for (const theme of themes) {
  for (const width of widths) {
    const suffix = `${width}${theme === 'dark' ? '-dark' : ''}`
    const context = await browser.newContext({
      viewport: { width, height: Number(value('height', '900')) },
      colorScheme: theme,
      locale: value('locale', 'en-US'),
    })
    const page = await context.newPage()
    const record = (text) => {
      const key = text.slice(0, 300)
      problems.set(key, [...(problems.get(key) ?? []), page.url().replace(base, '')])
    }
    page.on('console', (message) => {
      if (message.type() === 'error') record(message.text())
    })
    page.on('pageerror', error => record(String(error)))
    await page.addInitScript((mode) => {
      try {
        localStorage.setItem('nuxt-color-mode', mode)
      }
      catch {
        // storage unavailable: the system preference still applies
      }
    }, theme)

    for (const target of targets.filter(t => t.role === 'guest')) await capture(page, target.route, suffix)

    if (login && targets.some(t => t.role !== 'guest')) {
      await page.goto(`${base}/`)
      await page.locator('form input:not([type="password"])').first().fill(env.MONGOCAMP_ADMIN_USER)
      await page.locator('input[type="password"]').fill(env.MONGOCAMP_ADMIN_PASSWORD)
      await page.locator('form button[type="submit"]').click()
      const ok = await page.waitForURL('**/secured**', { timeout: 15000 }).then(() => true, () => false)
      if (!ok) {
        await page.screenshot({ path: `${outDir}/login-failed-${suffix}.png` })
        console.log(`login failed, see ${outDir}/login-failed-${suffix}.png`)
        await browser.close()
        process.exit(1)
      }
      for (const target of targets.filter(t => t.role !== 'guest')) await capture(page, target.route, suffix)
    }
    await context.close()
  }
}

if (problems.size) {
  console.log('console errors:')
  for (const [text, urls] of problems) console.log(`- ${text}\n  on ${[...new Set(urls)].join(', ')}`)
}
await browser.close()
