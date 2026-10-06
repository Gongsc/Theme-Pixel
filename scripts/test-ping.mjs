import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  appType: 'custom',
})

try {
  const { probeOrder } = await server.ssrLoadModule('/src/lib/probes.ts')
  const { pickProbes } = await server.ssrLoadModule('/src/api/ping.ts')
  const history = {
    probes: { '1': '浙江移动', '2': '浙江联通', '10': '浙江电信' },
    ping: [
      { task_id: 10, ts: 60, latency: null },
      { task_id: 10, ts: 120, latency: 165 },
      { task_id: 2, ts: 60, latency: 157 },
      { task_id: 1, ts: 60, latency: 132 },
    ],
  }
  const before = structuredClone(history)
  const ordered = probeOrder(history)
  assert.deepEqual(ordered, [['10', '浙江电信'], ['2', '浙江联通'], ['1', '浙江移动']])
  assert.deepEqual(history, before, 'Reading the order must preserve sample timestamps and values')

  const probes = ordered.map(([id, name]) => ({ id, name, latest: 10, avg: 10, loss: 0, recent: [10] }))
  const ids = items => items.map(p => p.id)
  assert.deepEqual(ids(pickProbes(probes, '', 2)), ['10', '2'])
  assert.deepEqual(ids(pickProbes(probes, ' ， , ', 2)), ['10', '2'])
  assert.deepEqual(ids(pickProbes(probes, ' 浙江移动，浙江电信,不存在 ', 1)), ['1', '10'])
  assert.deepEqual(ids(pickProbes([{ ...probes[0], name: ' TELECOM ' }], 'telecom', 1)), ['10'])

  // Repeated and unknown samples do not duplicate routes; idle routes remain available to the detail chart.
  assert.deepEqual(probeOrder({
    probes: { '1': '', '2': 'idle', '10': 'active' },
    ping: [{ task_id: 10 }, { task_id: 99 }, { task_id: 10 }, { task_id: 1 }],
  }), [['10', 'active'], ['1', ''], ['2', 'idle']])
  assert.deepEqual(probeOrder({ probes: history.probes, ping: [] }), [
    ['1', '浙江移动'], ['2', '浙江联通'], ['10', '浙江电信'],
  ])
  assert.deepEqual(probeOrder({ probes: {}, ping: [] }), [])

  console.log('Ping order passed: backend order, default limit, custom names, idle and unknown probes')
}
finally {
  await server.close()
}
