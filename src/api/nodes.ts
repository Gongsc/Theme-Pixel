import { ref, shallowRef } from 'vue'
import { api, ApiError } from './client'
import type { Node } from './types'

/** Live node list, shared by every view. */
export const nodes = shallowRef<Node[] | null>(null)
export const nodesError = ref('')
/** Set when the hub answers 401: the status page was closed while this tab was open. */
export const nodesClosed = ref(false)
export const live = ref(false)

/**
 * Throughput per push, for the whole fleet (null) and each group ("" is
 * ungrouped), so the summary above a group tab draws that group's line. Two
 * minutes at the hub's 2 s push interval.
 */
const KEEP = 60
export const speedHistory = shallowRef(new Map<string | null, { rx: number, tx: number }[]>())

function sample(list: Node[]) {
  const totals = new Map<string | null, { rx: number, tx: number }>()
  for (const n of list) {
    for (const key of [null, n.group ?? '']) {
      const t = totals.get(key) ?? { rx: 0, tx: 0 }
      if (n.online && n.metrics) {
        t.rx += n.metrics.net_rx
        t.tx += n.metrics.net_tx
      }
      totals.set(key, t)
    }
  }
  const next = new Map<string | null, { rx: number, tx: number }[]>()
  for (const [key, total] of totals) next.set(key, [...(speedHistory.value.get(key) ?? []), total].slice(-KEEP))
  speedHistory.value = next
}

const METRIC_FIELDS = ['uptime', 'cpu', 'mem_total', 'mem_used', 'swap_total', 'swap_used', 'disk_total', 'disk_used',
  'net_rx', 'net_tx', 'total_rx', 'total_tx', 'month_rx', 'month_tx', 'tcp', 'udp', 'procs'] as const

/** A malformed report must not take every other node off the page. */
function safeNodes(list: Node[]): Node[] {
  const ok = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0
  return list.map((node) => {
    const m = node.metrics
    return !m || (METRIC_FIELDS.every(k => ok(m[k])) && Array.isArray(m.load) && m.load.length === 3 && m.load.every(ok))
      ? node
      : { ...node, metrics: null }
  })
}

function receive(list: unknown) {
  if (!Array.isArray(list)) return
  const safe = safeNodes(list as Node[]).sort((a, b) => a.sort - b.sort || a.id - b.id)
  sample(safe)
  nodes.value = safe
  nodesError.value = ''
  nodesClosed.value = false
}

let started = false

/** Uses the WebSocket the hub pushes every two seconds, polling while it is down. */
export function startNodes() {
  if (started) return
  started = true
  let socket: WebSocket | null = null
  let poll: ReturnType<typeof setInterval> | null = null

  const fetchOnce = () => api<{ nodes: Node[] }>('/nodes')
    .then(d => receive(d.nodes))
    .catch((e: Error) => {
      nodesError.value = e.message
      if (e instanceof ApiError && e.status === 401) nodesClosed.value = true
    })

  const startPoll = () => { poll ??= setInterval(fetchOnce, 5000) }
  const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/ws`

  // A hub restart closes every stream; without reconnecting the page would
  // stay on the slower poll for the rest of its life.
  const connect = () => {
    try { socket = new WebSocket(url) }
    catch { startPoll(); return }
    socket.onmessage = (event) => {
      try { receive(JSON.parse(event.data).nodes) }
      catch { return }
      live.value = true
      if (poll) { clearInterval(poll); poll = null }
    }
    socket.onerror = () => socket?.close()
    socket.onclose = () => {
      live.value = false
      startPoll()
      setTimeout(connect, 5000)
    }
  }

  void fetchOnce()
  connect()
}
