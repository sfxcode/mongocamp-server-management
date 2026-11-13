// Screenshot helper for visual checks: logs in with the admin from .env and captures routes.
// Usage: node scripts/shots.mjs <outDir> [--dark] [--width=1440] [--no-login] [--eval=<js>] <route>...
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const args = process.argv.slice(2)
const outDir = args.shift()
const flags = args.filter(a => a.startsWith('--'))
const routes = args.filter(a => !a.startsWith('--'))
const flag = name => flags.find(f => f === `--${name}` || f.startsWith(`--${name}=`))
const value = (name, fallback) => flag(name)?.split('=').slice(1).join('=') ?? fallback

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
const width = Number(value('width', '1440'))
const dark = Boolean(flag('dark'))
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ channel: value('channel', 'chrome') })
const context = await browser.newContext({
  viewport: { width, height: Number(value('height', '900')) },
  colorScheme: dark ? 'dark' : 'light',
  locale: value('locale', 'en-US'),
})
const page = await context.newPage()
const problems = []
page.on('console', (message) => {
  if (message.type() === 'error') problems.push(message.text().slice(0, 300))
})
page.on('pageerror', error => problems.push(String(error).slice(0, 300)))
await page.addInitScript((mode) => {
  try {
    localStorage.setItem('nuxt-color-mode', mode)
  }
  catch {
    // storage unavailable: the system preference still applies
  }
}, dark ? 'dark' : 'light')

if (!flag('no-login')) {
  await page.goto(`${base}/`)
  const password = page.locator('input[type="password"]')
  await page.locator('form input:not([type="password"])').first().fill(env.MONGOCAMP_ADMIN_USER)
  await password.fill(env.MONGOCAMP_ADMIN_PASSWORD)
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/secured**', { timeout: 15000 }).catch(async () => {
    await page.screenshot({ path: `${outDir}/login-failed.png` })
    console.log(`login failed, see ${outDir}/login-failed.png\n${problems.join('\n')}`)
    await browser.close()
    process.exit(1)
  })
}

for (const route of routes) {
  await page.goto(`${base}${route}`)
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(Number(value('wait', '800')))
  const name = `${route.replace(/[^\w]+/g, '_').replace(/^_|_$/g, '') || 'index'}-${width}${dark ? '-dark' : ''}.png`
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: Boolean(flag('full')) })
  console.log(`${route} -> ${outDir}/${name} (${page.url().replace(base, '')})`)
  const script = value('eval')
  if (script) console.log(JSON.stringify(await page.evaluate(script), null, 1))
}

if (problems.length) console.log(`console errors:\n${[...new Set(problems)].join('\n')}`)
await browser.close()
