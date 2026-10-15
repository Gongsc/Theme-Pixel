import assert from 'node:assert/strict'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
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
try {
  const { remarkTags } = await server.ssrLoadModule('/src/lib/remarks.ts')
  const node = { public_remark: ' CN2；CN2;优化\n原生 IP ', remark: ' 客户A;内部编号；客户A\r\nCN2 ' }
  const before = structuredClone(node)
  assert.deepEqual(remarkTags(node, false), [
    { text: 'CN2', private: false }, { text: '优化', private: false }, { text: '原生 IP', private: false },
  ])
  assert.deepEqual(remarkTags(node, true).slice(3), [
    { text: '客户A', private: true }, { text: '内部编号', private: true }, { text: 'CN2', private: true },
  ])
  assert.deepEqual(remarkTags({ remark: 'legacy secret' }, false), [])
  assert.deepEqual(remarkTags({ public_remark: '', remark: 'secret' }, false), [])
  assert.deepEqual(remarkTags({ public_remark: '', remark: 'secret' }, true), [{ text: 'secret', private: true }])
  assert.deepEqual(remarkTags({}, true), [])
  assert.deepEqual(node, before)

  const { me } = await server.ssrLoadModule('/src/api/me.ts')
  const { default: NodeTags } = await server.ssrLoadModule('/src/components/NodeTags.vue')
  const render = () => renderToString(createSSRApp(NodeTags, { node }))
  for (const state of [null, { authed: false }, { authed: true }, { authed: false }]) {
    me.value = state
    const html = await render()
    assert.ok(html.includes('原生 IP'))
    assert.equal(html.includes('客户A'), state?.authed === true)
    assert.equal(html.includes('私有备注（仅管理员可见）'), state?.authed === true)
  }
  const html = await renderToString(createSSRApp(NodeTags, { node: { public_remark: '<script>alert(1)</script>' } }))
  assert.ok(!html.includes('<script>'))
  console.log('Remarks passed: public/private coexistence, auth changes, legacy fields, splitting, deduplication and escaped rendering')
}
finally { await server.close() }
