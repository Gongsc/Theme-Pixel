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
  public_remark?: string
}

export type Me = { authed: boolean, github: boolean, site_name: string, public_page: boolean }

export type History = {
  metrics: { ts: number, cpu: number, mem_used: number, disk_used: number, net_rx: number, net_tx: number }[]
  ping: { ts: number, task_id: number, latency: number | null, loss?: number }[]
  probes: Record<string, string>
  loss?: Record<string, number>
}
