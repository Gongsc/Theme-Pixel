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

/** Failures in a row before the error shows: a phone back from the background often has no network for a second or two. */
const FAILURE_LIMIT = 3

/** `?gzip` frames are compressed binary (hub 1.4.0+); signed-in views and older hubs still send text. */
const GZIP = typeof DecompressionStream === 'function'

async function frameText(data: unknown): Promise<string> {
  if (typeof data === 'string') return data
  const stream = new Blob([data as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).text()
}

/**
 * Uses the WebSocket the hub pushes every two seconds, polling while it is
 * down. A hub already holding its 1000 anonymous streams answers the handshake
 * with 503, so retries back off to a minute while the poll carries the page.
 * A hidden page holds neither: phones cut its connections silently, so it
 * drops them and starts afresh when shown again.
 */
export function startNodes() {
  if (started) return
  started = true
  let socket: WebSocket | null = null
  let poll: ReturnType<typeof setInterval> | null = null
  let retry: ReturnType<typeof setTimeout> | null = null
  let backoff = 5000
  let controller: AbortController | undefined
  let failures = 0
  let updated = 0
  let resumed = 0

  const fetchOnce = () => {
    controller?.abort()
    const ac = controller = new AbortController()
    return api<{ nodes: Node[] }>('/nodes', ac.signal)
      .then((d) => { failures = 0; updated = Date.now(); receive(d.nodes) })
      .catch((e: Error) => {
        if (e.name === 'AbortError') return
        if (e instanceof ApiError && e.status === 401) nodesClosed.value = true
        if (++failures >= FAILURE_LIMIT || !nodes.value) nodesError.value = e.message
      })
  }

  const startPoll = () => { poll ??= setInterval(fetchOnce, 5000) }
  const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/ws${GZIP ? '?gzip' : ''}`

  // A hub restart closes every stream; without reconnecting the page would
  // stay on the slower poll for the rest of its life.
  const connect = () => {
    retry = null
    let ws: WebSocket
    try { ws = socket = new WebSocket(url) }
    catch { startPoll(); return }
    ws.binaryType = 'arraybuffer'
    ws.onopen = () => { backoff = 5000 }
    ws.onmessage = async (event) => {
      try { receive(JSON.parse(await frameText(event.data)).nodes) }
      catch { return }
      if (socket !== ws) return
      failures = 0
      updated = Date.now()
      live.value = true
      if (poll) { clearInterval(poll); poll = null }
    }
    ws.onerror = () => ws.close()
    ws.onclose = () => {
      if (socket !== ws) return
      socket = null
      live.value = false
      startPoll()
      retry = setTimeout(connect, backoff)
      backoff = Math.min(backoff * 2, 60_000)
    }
  }

  const pause = () => {
    controller?.abort()
    if (poll) { clearInterval(poll); poll = null }
    if (retry) { clearTimeout(retry); retry = null }
    const ws = socket
    socket = null
    ws?.close()
    live.value = false
    failures = 0
  }

  const resume = () => {
    pause()
    resumed = Date.now()
    backoff = 5000
    void fetchOnce()
    connect()
  }

  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume())
  // A home-screen web app on iOS may wake without visibilitychange, or late:
  // data older than two poll intervals on a visible page means it just woke.
  const wake = () => { if (!document.hidden && Date.now() - Math.max(updated, resumed) > 10_000) resume() }
  window.addEventListener('pageshow', wake)
  window.addEventListener('focus', wake)

  void fetchOnce()
  connect()
}
