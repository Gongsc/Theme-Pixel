import type { History } from '../api/types'

/**
 * The hub emits ping rows probe by probe in the operator's order. Integer
 * keys in `probes` are reordered by JavaScript, so take the order from rows
 * and append any probes with no samples in this window.
 */
export function probeOrder(h: Pick<History, 'ping' | 'probes'>): [string, string][] {
  const probes = h.probes ?? {}
  const ids = new Set([...(h.ping ?? []).map(p => String(p.task_id)), ...Object.keys(probes)])
  return [...ids].filter(id => Object.hasOwn(probes, id)).map(id => [id, probes[id]!])
}
