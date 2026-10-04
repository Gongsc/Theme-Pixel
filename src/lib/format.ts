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

const MONEY = new Map<string, Intl.NumberFormat>()

/**
 * Written the Chinese way, symbol or code before the number, as the hub's
 * panel writes it. Intl throws on anything but three letters, which hubs
 * before 1.3.1 could store, so that falls back to the code as written.
 */
export function money(amount: number, currency: string): string {
  try {
    let format = MONEY.get(currency)
    if (!format) MONEY.set(currency, format = new Intl.NumberFormat('zh-CN', { style: 'currency', currency, maximumFractionDigits: 2 }))
    return format.format(amount)
  }
  catch {
    return `${currency} ${amount.toFixed(2)}`.trim()
  }
}

// Hub 1.3.0 and earlier store only these names; 1.3.1+ stores any other length as `<n>m`.
const NAMED_CYCLES: Record<string, number> = { monthly: 1, quarterly: 3, semiannual: 6, yearly: 12, biennial: 24, triennial: 36 }
const CYCLE_WORDS: Record<number, string> = { 1: '月付', 3: '季付', 6: '半年付', 12: '年付' }

/** How a billing cycle reads: 月付, 5 年付, 18 个月付, 一次性. */
export function cycle(billing: string): string {
  if (billing === 'once') return '一次性'
  const months = NAMED_CYCLES[billing] ?? Number(/^(\d+)m$/.exec(billing)?.[1])
  if (!months) return billing
  return CYCLE_WORDS[months] ?? (months % 12 ? `${months} 个月付` : `${months / 12} 年付`)
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

const MMDD = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' })

export const fullClock = (ms: number) => MDHHMM.format(ms)

/** The date alone once every tick is a local midnight, where "00:00" beside each says nothing. */
export function tickClock(ticks: number[], hours: number): (ms: number) => string {
  const midnight = (t: number) => { const d = new Date(t); return d.getHours() === 0 && d.getMinutes() === 0 }
  return ticks.length > 0 && ticks.every(midnight) ? ms => MMDD.format(ms) : clockFor(hours)
}

const DAY = 1440
const TICK_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 180, 360, 720, DAY, 2 * DAY, 7 * DAY, 14 * DAY, 30 * DAY, 60 * DAY, 90 * DAY]
  .map(m => m * 60_000)

// Round chart windows, in hours: up to a week the hub draws them from minute
// rows, past it from its hourly tier.
const WINDOWS = [1, 6, 24, 168, 720, 2160]

/**
 * The windows offered for a hub keeping `days` of history: the round windows
 * shorter than it, then the whole of it. A window past it would be narrowed by
 * the hub without saying so, under a label claiming more than it holds. A round
 * window the whole exceeds by less than a quarter is left out, as it would sit
 * beside one of nearly the same length: 30 and 31 days.
 */
export function windows(days: number): { hours: number, label: string }[] {
  const whole = Math.max(1, Math.floor(days)) * 24
  return [...WINDOWS.filter(h => h * 1.25 <= whole), whole].map(hours => ({
    hours,
    label: hours < 24 ? `${hours}H` : hours === 24 ? '24H' : hours === 8760 ? '1Y' : `${hours / 24}D`,
  }))
}

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
