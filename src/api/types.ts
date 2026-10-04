export type Metrics = {
  uptime: number
  cpu: number
  load: [number, number, number]
  mem_total: number
  mem_used: number
  swap_total: number
  swap_used: number
  disk_total: number
  disk_used: number
  net_rx: number
  net_tx: number
  total_rx: number
  total_tx: number
  month_rx: number
  month_tx: number
  tcp: number
  udp: number
  procs: number
}

export type Node = {
  id: number
  name: string
  sort: number
  /** Empty when ungrouped; absent on hubs predating groups. */
  group?: string
  public: boolean
  online: boolean
  /** ISO 3166-1 alpha-2, or empty when the hub could not locate the address. */
  country: string
  last_seen: number
  metrics: Metrics | null
  os: string
  kernel: string
  arch: string
  virt: string
  cpu_name: string
  cpu_cores: number
  mem_total: number
  swap_total: number
  disk_total: number
  agent_version: string
  price: number
  currency: string
  billing_cycle: string
  expires_at: string | null
  /** Hub calendar days, negative once past; null without a date, absent on older hubs. */
  expires_in?: number | null
  traffic_limit: number
  traffic_mode: string
  traffic_reset_day: number
  total_rx: number
  total_tx: number
  month_rx: number
  month_tx: number
  /** This period's usage as the plan meters it. Absent on older hubs. */
  month_used?: number
  month_start: string
  day_rx: number
  day_tx: number
  /** The operator's one line for visitors, up to 100 characters. Hub 1.3.2+. */
  public_remark?: string
  /**
   * The operator's private note. The hub sends it to a signed-in administrator
   * only; anonymous visitors never receive it.
   */
  remark?: string
}

export type Me = {
  authed: boolean
  github: boolean
  site_name: string
  public_page: boolean
  /** Days of history the hub keeps. Hub 1.3.2+; older hubs kept 7. */
  history_days?: number
}

export type MetricPoint = {
  ts: number
  cpu: number
  mem_used: number
  disk_used: number
  net_rx: number
  net_tx: number
  /** Highest CPU within the bucket. Hub 1.3.2+. */
  cpu_max?: number
  /** Highest rate measured within the bucket, never below its mean. Hub 1.3.1+. */
  net_rx_max?: number
  net_tx_max?: number
  /** Minutes with data; `step / 60` when full, fewer for the bucket still filling. Hub 1.3.2+. */
  minutes?: number
}

export type History = {
  /** Seconds each point covers. Hub 1.3.2+; windows past 168 h read hourly rollups. */
  step?: number
  metrics: MetricPoint[]
  ping: { ts: number, task_id: number, latency: number | null, loss?: number }[]
  probes: Record<string, string>
  loss?: Record<string, number>
}
