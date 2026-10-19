import type { Node } from '../api/types'
import type { Probe } from '../api/ping'
import { percent, trafficUsed } from './format'

export type SortKey = 'name' | 'cpu' | 'ram' | 'disk' | 'network' | 'ping' | 'month' | 'uptime'
export type SortDirection = 'ascending' | 'descending'

const names = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })

function value(n: Node, key: SortKey, pings?: Map<number, Probe[]>): string | number | null {
  if (key === 'name') return n.name
  if (key === 'month') return trafficUsed(n)
  const m = n.online ? n.metrics : null
  if (!m) return null
  switch (key) {
    case 'cpu': return m.cpu
    case 'ram': return percent(m.mem_used, n.mem_total)
    case 'disk': return percent(m.disk_used, n.disk_total)
    case 'network': return m.net_rx + m.net_tx
    case 'uptime': return m.uptime
    case 'ping': {
      const samples = (pings?.get(n.id) ?? []).map(p => p.latest)
        .filter((v): v is number => v !== null && Number.isFinite(v))
      return samples.length ? samples.reduce((sum, v) => sum + v, 0) / samples.length : null
    }
  }
}

/** Sort a copy, preserving input order for ties and keeping missing data last in either direction. */
export function sortNodes(nodes: Node[], key: SortKey, direction: SortDirection, pings?: Map<number, Probe[]>): Node[] {
  const rows = nodes.map(node => {
    const v = value(node, key, pings)
    return { node, value: typeof v === 'number' && !Number.isFinite(v) ? null : v }
  })
  rows.sort((a, b) => {
    if (a.value === null) return b.value === null ? 0 : 1
    if (b.value === null) return -1
    const order = typeof a.value === 'string' && typeof b.value === 'string'
      ? names.compare(a.value, b.value)
      : Number(a.value) - Number(b.value)
    return direction === 'ascending' ? order : -order
  })
  return rows.map(row => row.node)
}
