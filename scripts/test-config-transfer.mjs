import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})
const originalFetch = globalThis.fetch
try {
  const { me } = await server.ssrLoadModule('/src/api/me.ts')
  const { configDefaults, config, loadConfig } = await server.ssrLoadModule('/src/api/config.ts')
  const { exportThemeSettings, importThemeSettings, readThemeSettings, saveThemeSettings } = await server.ssrLoadModule('/src/lib/config-transfer.ts')
  const saved = { notice: '公告\n第二行', showPrice: true, hidePriceForGuests: true, pingProbes: 4, animatedBackground: false }
  const original = structuredClone(saved)
  const contents = exportThemeSettings(saved)
  const parsed = JSON.parse(contents)
  assert.equal(configDefaults.animatedBackground, true, 'Existing sites keep animated backgrounds by default')
  assert.equal(parsed.config.animatedBackground, false, 'Exports preserve static mode')
  assert.deepEqual(importThemeSettings(contents).values, { ...configDefaults, ...saved })
  assert.deepEqual(saved, original)
  const file = config => JSON.stringify({ ...parsed, config })
  assert.throws(() => importThemeSettings(JSON.stringify({ ...parsed, theme: { short: 'other' } })), /其他主题/)
  assert.throws(() => importThemeSettings(JSON.stringify({ ...parsed, version: 2 })), /导出配置/)
  for (const value of ['bad json', 'null', '[]']) assert.throws(() => importThemeSettings(value))
  for (const config of [null, [], { showPrice: 'false' }, { animatedBackground: 'false' }, { pingProbes: 0 }, { pingProbes: 7 }, { defaultRange: 'bogus' }, { logoUrl: 42 }]) {
    assert.throws(() => importThemeSettings(file(config)))
  }
  assert.throws(() => importThemeSettings(' '.repeat(256 * 1024 + 1)), /256 KiB/)
  const older = importThemeSettings('\uFEFF' + file({ notice: '旧备份', retired: 42 }))
  assert.deepEqual(older.values, { ...configDefaults, notice: '旧备份' })
  assert.equal(older.ignored, 1)
  assert.equal(importThemeSettings(file(JSON.parse('{"__proto__":{"polluted":true}}'))).ignored, 1)
  assert.equal({}.polluted, undefined)

  globalThis.fetch = async () => Response.json({ animatedBackground: false })
  await loadConfig()
  assert.equal(config.value.animatedBackground, false, 'Saved false must not be replaced with the default')
  for (const legacy of [{}, { animatedBackground: 'false' }]) {
    globalThis.fetch = async () => Response.json(legacy)
    await loadConfig()
    assert.equal(config.value.animatedBackground, true, 'Missing or invalid settings use the default')
  }

  let calls = []
  globalThis.fetch = async (path, init) => {
    calls.push({ path, ...init })
    return init?.method === 'PUT' ? new Response(null, { status: 204 }) : Response.json({ ...saved, futureOption: 'preserve' })
  }
  me.value = { authed: false }
  await assert.rejects(readThemeSettings, /登录/)
  await assert.rejects(() => saveThemeSettings(older.values), /登录/)
  assert.equal(calls.length, 0)
  me.value = { authed: true }
  await saveThemeSettings(older.values)
  assert.deepEqual(JSON.parse(calls[1].body), { notice: '旧备份', futureOption: 'preserve' })
  assert.equal(calls[1].credentials, 'same-origin')
  assert.equal(calls[1].headers['content-type'], 'application/json')
  assert.equal(calls[1].path, '/api/themes/pixel/config')

  calls = []
  await saveThemeSettings({ ...configDefaults, animatedBackground: false })
  assert.equal(JSON.parse(calls[1].body).animatedBackground, false, 'Saves preserve static mode')

  calls = []
  globalThis.fetch = async (path, init) => { calls.push(init?.method || 'GET'); return new Response('denied', { status: 401 }) }
  await assert.rejects(() => saveThemeSettings(older.values))
  assert.deepEqual(calls, ['GET'], 'Failed reads must never become a defaults-only write')
  globalThis.fetch = async () => Response.json([])
  await assert.rejects(readThemeSettings, /响应无效/)
  calls = []
  globalThis.fetch = async (path, init) => { calls.push(init?.method || 'GET'); return Response.json({}) }
  await assert.rejects(() => saveThemeSettings({ ...older.values, notice: '界'.repeat(23000) }), /64 KiB/)
  assert.deepEqual(calls, ['GET'])
  globalThis.fetch = async (path, init) => init?.method === 'PUT' ? new Response('denied', { status: 403 }) : Response.json(saved)
  await assert.rejects(() => saveThemeSettings(older.values))
  console.log('Config transfer passed: round-trip, validation, defaults, auth, safe writes, future fields, size limits and failures')
}
finally {
  globalThis.fetch = originalFetch
  await server.close()
}
