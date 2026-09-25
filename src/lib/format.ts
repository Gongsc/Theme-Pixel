const UNITS = ['B', 'K', 'M', 'G', 'T', 'P']

const unitOf = (n: number) => Math.min(Math.floor(Math.log(n) / Math.log(1024)), UNITS.length - 1)

/** 1024-based with short units, as VPS plans and `df -h` write them. Three significant digits by default. */
export function bytes(n: number, digits?: number): string {
  if (!n || n < 1) return '0B'
  const i = unitOf(n)
  const v = n / 1024 ** i
  return `${v.toFixed(i === 0 ? 0 : (digits ?? (v >= 100 ? 0 : v >= 10 ? 1 : 2)))}${UNITS[i]}`
}

/** "used/total", writing a shared unit once. */
export function pair(used: number, total: number): string {
  if (used > 0 && total > 0 && unitOf(used) === unitOf(total)) {
    const i = unitOf(total)
    const f = (n: number) => (n / 1024 ** i).toFixed(i === 0 ? 0 : 1)
    return `${f(used)}/${f(total)}${UNITS[i]}`
  }
  return `${bytes(used)}/${bytes(total)}`
}

export function rate(n: number): string {
  return `${bytes(n, 1)}/s`
}

export function percent(used: number, total: number): number {
  return total > 0 ? Math.min(100, (used / total) * 100) : 0
}

export function uptime(seconds: number): string {
  if (!seconds) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return d > 0 ? `${d}天${h}时` : h > 0 ? `${h}时${m}分` : `${m}分`
}

export function ago(unix: number): string {
  if (!unix) return '从未上线'
  const s = Math.max(0, Date.now() / 1000 - unix)
  if (s < 60) return '刚刚'
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`
  return `${Math.floor(s / 86400)} 天前`
}

/** Days until expiry: the hub's own count when it sends one, else from the date. */
export function expiresIn(n: { expires_in?: number | null, expires_at: string | null }): number | null {
  if (n.expires_in !== undefined) return n.expires_in
  if (!n.expires_at) return null
  const target = new Date(`${n.expires_at.slice(0, 10)}T00:00:00`).getTime()
  return Number.isNaN(target) ? null : Math.ceil((target - Date.now()) / 86400000)
}

const SYMBOLS: Record<string, string> = { USD: '$', CNY: '¥', EUR: '€', GBP: '£', JPY: '¥' }

export function money(amount: number, currency: string): string {
  const s = SYMBOLS[currency]
  return s ? `${s}${amount.toFixed(2)}` : `${amount.toFixed(2)} ${currency}`
}

export const CYCLES: Record<string, string> = {
  monthly: '月', quarterly: '季', semiannual: '半年', yearly: '年', biennial: '两年', triennial: '三年', once: '一次性',
}

export function osName(name: string): string {
  return name.replace('GNU/Linux ', '').replace(/\s*\([^)]*\)\s*$/, '')
}

export function cpuName(name: string): string {
  return name
    .replace(/\((R|TM|r|tm)\)/g, '')
    .replace(/\s+(CPU|Processor)\b/g, '')
    .replace(/\s+\d+-Core\b/g, '')
    .replace(/\s+@.*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}


/** Month's usage as the plan meters it: sum, the larger direction, upload or download. */
export function trafficUsed(n: { traffic_mode: string, month_rx: number, month_tx: number, month_used?: number }): number {
  if (n.month_used !== undefined) return n.month_used
  switch (n.traffic_mode) {
    case 'max': return Math.max(n.month_rx, n.month_tx)
    case 'rx': case 'in': return n.month_rx
    case 'tx': case 'out': return n.month_tx
    default: return n.month_rx + n.month_tx
  }
}

// ---- chart axes ----

const HHMM = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
const MDHHMM = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })

/** Beyond a day a bare "14:00" recurs each midnight, so the day is added. */
export function clockFor(hours: number): (ms: number) => string {
  return hours <= 24 ? ms => HHMM.format(ms) : ms => MDHHMM.format(ms)
}

export const fullClock = (ms: number) => MDHHMM.format(ms)

const TICK_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 180, 360, 720, 1440, 2880].map(m => m * 60_000)

/** Ticks on round clock values, phased on local midnight. */
export function timeTicks(from: number, to: number, count = 6): number[] {
  const step = TICK_STEPS.find(s => (to - from) / s <= count) ?? TICK_STEPS[TICK_STEPS.length - 1]!
  const zone = new Date(from).getTimezoneOffset() * 60_000
  const ticks: number[] = []
  for (let t = Math.ceil((from - zone) / step) * step + zone; t <= to; t += step) ticks.push(t)
  return ticks
}

const LADDER: Record<number, number[]> = {
  10: [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10],
  1024: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
}

/**
 * A zero-anchored axis top whose quarters are round numbers. `floor` keeps an
 * idle machine looking idle rather than scaling every blip into a peak.
 */
export function axisTop(max: number, floor: number, base = 10, cap = Infinity): number {
  const target = Math.min(cap, Math.max(max, floor)) / 4
  const scale = base ** Math.floor(Math.log(target) / Math.log(base))
  const step = LADDER[base]!.map(m => m * scale).find(n => n >= target)
  return Math.min(cap, (step ?? target) * 4)
}
