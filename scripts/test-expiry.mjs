import assert from 'node:assert/strict'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const server = await createServer({
  configFile: false,
  plugins: [vue()],
  resolve: { alias: { '@': `${import.meta.dirname}/../src` } },
  server: { middlewareMode: true, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})
const originalNow = Date.now
const originalFetch = globalThis.fetch
try {
  const { expiryReminders } = await server.ssrLoadModule('/src/lib/expiry.ts')
  const { config, configDefaults, loadConfig } = await server.ssrLoadModule('/src/api/config.ts')
  const { exportThemeSettings, importThemeSettings } = await server.ssrLoadModule('/src/lib/config-transfer.ts')
  const { default: ExpiryReminder } = await server.ssrLoadModule('/src/components/ExpiryReminder.vue')
  const node = (id, days, extra = {}) => ({ id, name: `Node ${id}`, expires_at: '2026-10-22', expires_in: days, ...extra })
  const nodes = [node(1, 8), node(2, 7), node(3, 0), node(4, 2), node(5, -3), node(6, -1), node(7, null), node(8, 1, { expires_at: null }), node(9, NaN)]
  const before = structuredClone(nodes)
  const ids = entries => entries.map(entry => entry.node.id)
  const result = expiryReminders(nodes, 7)
  assert.deepEqual(ids(result.upcoming), [3, 4, 2], 'Today and the inclusive threshold are included, ordered by remaining days')
  assert.deepEqual(ids(result.expired), [6, 5], 'Expired nodes are separate, most recent first')
  assert.deepEqual(nodes, before, 'Sorting must not change the dashboard node order')
  assert.deepEqual(ids(expiryReminders([node(1, 2), node(2, 2)], 7).upcoming), [1, 2])
  for (const days of [0, -1, NaN, Infinity]) {
    assert.deepEqual(expiryReminders(nodes, days), { days: 0, upcoming: [], expired: [] })
  }
  assert.deepEqual(ids(expiryReminders(nodes, 2.9).upcoming), [3, 4])
  assert.equal(expiryReminders(nodes, 999).days, 365)

  Date.now = () => new Date(2026, 9, 22, 12).getTime()
  const legacy = [node(10, undefined), node(11, undefined, { expires_at: '2026-10-29' }), node(12, undefined, { expires_at: '2026-10-21' }), node(13, undefined, { expires_at: 'invalid' })]
  assert.deepEqual(ids(expiryReminders(legacy, 7).upcoming), [10, 11], 'Older hubs fall back to the date, including today')
  assert.deepEqual(ids(expiryReminders(legacy, 7).expired), [12])
  assert.deepEqual(ids(expiryReminders([node(14, 5, { expires_at: '2000-01-01' })], 7).upcoming), [14], 'Hub calendar takes precedence over the browser clock')

  assert.equal(configDefaults.expiryReminderDays, 7)
  for (const value of [0, 1, 365]) {
    const imported = importThemeSettings(exportThemeSettings({ expiryReminderDays: value }))
    assert.equal(imported.values.expiryReminderDays, value)
  }
  for (const value of [-1, 366, '7']) {
    const backup = JSON.parse(exportThemeSettings({}))
    backup.config.expiryReminderDays = value
    assert.throws(() => importThemeSettings(JSON.stringify(backup)))
  }
  for (const saved of [{}, { expiryReminderDays: 0 }, { expiryReminderDays: 14 }, { expiryReminderDays: -1 }]) {
    globalThis.fetch = async () => Response.json(saved)
    await loadConfig()
    assert.equal(config.value.expiryReminderDays, saved.expiryReminderDays >= 0 ? saved.expiryReminderDays : 7)
  }

  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: {} }, { path: '/node/:id', component: {} }] })
  await router.push('/')
  await router.isReady()
  const render = list => renderToString(createSSRApp(ExpiryReminder, { nodes: list, group: null }).use(router))
  config.value = { ...configDefaults, expiryReminderDays: 0 }
  assert.equal(await render(nodes), '<!---->', 'Disabled means no section, heading, border or placeholder')
  config.value = { ...configDefaults, expiryReminderDays: 7 }
  for (const list of [[], [node(1, 8)], [node(1, null)], [node(1, 1, { expires_at: null })]]) {
    assert.equal(await render(list), '<!---->', 'No qualifying nodes means no section at all')
  }
  const html = await render([node(1, 7), node(2, 0), node(3, 2), node(4, 3), node(5, -1)])
  assert.ok(html.includes('今天到期'))
  assert.ok(html.includes('剩余 2 天'))
  assert.ok(html.includes('查看全部 4 台'))
  assert.ok(html.includes('href="/node/2"'))
  assert.ok(!html.includes('href="/node/1"'), 'Only the first three upcoming nodes render initially')
  assert.match(html, /id="expired-nodes"[^>]*style="display:none;"/)
  assert.ok(html.includes('已到期 1 台'))
  const expiredOnly = await render([node(1, -1)])
  assert.ok(expiredOnly.includes('已到期 1 台'), 'Expired-only groups still provide the collapsed overdue reminder')
  assert.ok(!expiredOnly.includes('id="upcoming-expiry-nodes"'))
  assert.ok((await render([node(1, 2, { name: '<script>alert(1)</script>' })])).includes('&lt;script&gt;'))
  console.log('Expiry reminders passed: boundaries, ordering, legacy dates, config round-trip, disabled/empty rendering and collapsed lists')
}
finally {
  Date.now = originalNow
  globalThis.fetch = originalFetch
  await server.close()
}
