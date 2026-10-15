import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})

try {
  const { config, loadConfig, showNodePrice } = await server.ssrLoadModule('/src/api/config.ts')
  const { me } = await server.ssrLoadModule('/src/api/me.ts')
  const defaults = { ...config.value }
  assert.equal(defaults.hidePriceForGuests, false)

  for (const showPrice of [false, true]) {
    for (const hidePriceForGuests of [false, true]) {
      for (const authed of [null, false, true]) {
        config.value = { ...defaults, showPrice, hidePriceForGuests }
        me.value = authed === null ? null : { authed }
        assert.equal(showNodePrice.value,
          showPrice && (!hidePriceForGuests || authed === true),
          JSON.stringify({ showPrice, hidePriceForGuests, authed }))
      }
    }
  }

  const originalFetch = globalThis.fetch
  try {
    // Existing settings lack the new option; retain public prices when enabled.
    globalThis.fetch = async () => Response.json({ showPrice: true })
    me.value = { authed: false }
    await loadConfig()
    assert.equal(showNodePrice.value, true)

    globalThis.fetch = async () => Response.json({ showPrice: true, hidePriceForGuests: true })
    await loadConfig()
    assert.equal(showNodePrice.value, false)
    me.value = { authed: true }
    assert.equal(showNodePrice.value, true)
    config.value = { ...config.value, showPrice: false }
    assert.equal(showNodePrice.value, false, 'The master switch also hides prices after login')
  }
  finally {
    globalThis.fetch = originalFetch
  }
  console.log('Price visibility passed: master switch, guest restriction, login changes and legacy settings')
}
finally {
  await server.close()
}
