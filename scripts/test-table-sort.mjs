import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})

try {
  const { sortNodes } = await server.ssrLoadModule('/src/lib/table-sort.ts')
  const a = {
    id: 1, name: '节点 10', online: true, mem_total: 100, disk_total: 200,
    traffic_mode: 'sum', month_rx: 1000, month_tx: 1000,
    metrics: { cpu: 9, mem_used: 80, disk_used: 100, net_rx: 10, net_tx: 90, uptime: 3600 },
  }
  const b = {
    ...a, id: 2, name: '节点 2', mem_total: 400, disk_total: 1000, month_used: 500,
    metrics: { cpu: 80, mem_used: 100, disk_used: 200, net_rx: 50, net_tx: 10, uptime: 86400 },
  }
  const offline = { ...a, id: 3, online: false }
  const missing = { ...a, id: 4, metrics: null }
  const nodes = [a, b, offline, missing]
  const before = structuredClone(nodes)
  const ids = list => list.map(n => n.id)
  const pings = new Map([
    [1, [{ latest: 30 }, { latest: null }, { latest: 70 }]],
    [2, [{ latest: 100 }, { latest: 20 }]],
    [3, [{ latest: 1 }]],
  ])
  for (const [key, expected] of [
    ['cpu', [1, 2]], ['ram', [2, 1]], ['disk', [2, 1]],
    ['network', [2, 1]], ['uptime', [1, 2]], ['ping', [1, 2]],
  ]) {
    assert.deepEqual(ids(sortNodes(nodes, key, 'ascending', pings)), [...expected, 3, 4], `${key} ascending`)
    assert.deepEqual(ids(sortNodes(nodes, key, 'descending', pings)), [...expected.toReversed(), 3, 4], `${key} descending, missing last`)
  }
  assert.deepEqual(ids(sortNodes([a, b], 'name', 'ascending')), [2, 1], 'Names use natural number order')
  assert.deepEqual(ids(sortNodes([a, b], 'name', 'descending')), [1, 2])
  assert.deepEqual(ids(sortNodes([a, b], 'month', 'ascending')), [2, 1], 'Use metered byte usage')
  assert.deepEqual(ids(sortNodes([a, b], 'month', 'descending')), [1, 2])
  assert.deepEqual(ids(sortNodes([a, offline], 'month', 'ascending')), [1, 3], 'Equal values preserve input order')
  assert.deepEqual(ids(sortNodes([a, b], 'ping', 'ascending', new Map([[1, [{ latest: null }]], [2, [{ latest: 0 }]]]))), [2, 1], 'Zero latency is valid; timeout is missing')
  assert.deepEqual(nodes, before, 'Sorting must not change source nodes or metrics')
  console.log('Table sorting passed: all columns, directions, natural names, missing data, ties and source preservation')
}
finally {
  await server.close()
}
