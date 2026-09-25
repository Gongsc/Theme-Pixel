import { onBeforeUnmount, onMounted, shallowRef, watch, type WatchStopHandle } from 'vue'
import { api } from './client'
import { config } from './config'
import { nodes } from './nodes'
import type { History } from './types'

export type Probe = {
  id: string
  name: string
  /** Latest round trip in ms; null when the latest probe timed out. */
  latest: number | null
  avg: number | null
  /** Percentage lost over the hub's window. */
  loss: number
  /** Most recent samples, oldest first; null is a timeout. */
  recent: (number | null)[]
}

const RECENT = 24
const REFRESH = 60_000

/** Probe summaries per node id, for the list page. */
export const pings = shallowRef(new Map<number, Probe[]>())

function summarize(h: Pick<History, 'ping' | 'probes' | 'loss'>): Probe[] {
  return Object.entries(h.probes ?? {}).map(([id, name]) => {
    const rows = (h.ping ?? []).filter(p => String(p.task_id) === id).sort((a, b) => a.ts - b.ts)
    const ok = rows.map(p => p.latency).filter((v): v is number => v !== null)
    return {
      id,
      name,
      latest: rows.at(-1)?.latency ?? null,
      avg: ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : null,
      loss: h.loss?.[id] ?? 0,
      recent: rows.slice(-RECENT).map(p => p.latency),
    }
  }).filter(p => p.recent.length > 0)
}

async function mapLimited<T>(items: T[], worker: (item: T) => Promise<void>, limit = 4) {
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await worker(items[next++]!)
  }))
}

let running = false

async function refresh() {
  const list = nodes.value
  if (running || !list?.length || !config.value.showPing || document.hidden) return
  running = true
  const next = new Map(pings.value)
  const ids = new Set(list.map(n => n.id))
  for (const id of next.keys()) if (!ids.has(id)) next.delete(id)
  try {
    await mapLimited(list.filter(n => n.online), async (n) => {
      try {
        next.set(n.id, summarize(await api<History>(`/nodes/${n.id}/metrics?hours=1&series=ping`)))
      }
      catch { /* keep the last summary for this node */ }
    })
    pings.value = next
  }
  finally {
    running = false
  }
}

let users = 0
let timer: ReturnType<typeof setInterval> | undefined
let stopWatch: WatchStopHandle | undefined
const onVisible = () => { if (!document.hidden) void refresh() }

/** Keeps `pings` fresh while at least one mounted component needs it. */
export function usePings() {
  onMounted(() => {
    if (users++) return
    // Fires once the node list first arrives, and again when nodes come or go.
    stopWatch = watch(() => [nodes.value?.map(n => n.id).join(), config.value.showPing], () => void refresh(), { immediate: true })
    timer = setInterval(refresh, REFRESH)
    document.addEventListener('visibilitychange', onVisible)
  })
  onBeforeUnmount(() => {
    if (--users) return
    stopWatch?.()
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
  })
}

/**
 * The routes to show: those named in the setting, in its order, else the
 * first `limit`. Names match without regard to case or surrounding spaces;
 * either comma works, since the setting is typed with a Chinese keyboard.
 */
export function pickProbes(probes: Probe[], names: string, limit: number): Probe[] {
  const wanted = names.split(/[,，]/).map(s => s.trim().toLowerCase()).filter(Boolean)
  if (!wanted.length) return probes.slice(0, limit)
  return wanted.flatMap(w => probes.filter(p => p.name.trim().toLowerCase() === w))
}

/** Latency tiers shared by every latency readout. */
export function latencyColor(ms: number | null): string {
  if (ms === null) return 'var(--red)'
  return ms < 100 ? 'var(--green)' : ms < 200 ? 'var(--yellow)' : 'var(--red)'
}
