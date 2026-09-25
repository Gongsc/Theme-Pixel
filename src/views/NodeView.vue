<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { api } from '@/api/client'
import { config } from '@/api/config'
import { nodes } from '@/api/nodes'
import type { History } from '@/api/types'
import PixelBar from '@/components/PixelBar.vue'
import PixelChart from '@/components/PixelChart.vue'
import PixelIcon from '@/components/PixelIcon.vue'
import {
  axisTop, bytes, clockFor, cpuName, CYCLES, expiresIn, fullClock, money, osName, pair, percent, rate, timeTicks, trafficUsed, uptime,
} from '@/lib/format'

const props = defineProps<{ id: number }>()

const node = computed(() => nodes.value?.find(n => n.id === props.id))
const m = computed(() => (node.value?.online ? node.value.metrics : null))

const RANGES = [
  { hours: 1, label: '1H' },
  { hours: 6, label: '6H' },
  { hours: 24, label: '24H' },
  { hours: 168, label: '7D' },
]
const hours = ref(Number(config.value.defaultRange) || 1)
const metrics = shallowRef<History['metrics']>([])
const ping = shallowRef<Pick<History, 'ping' | 'probes' | 'loss'>>({ ping: [], probes: {} })
const loading = ref(false)
const error = ref('')

let controller: AbortController | undefined
async function load() {
  controller?.abort()
  const ac = controller = new AbortController()
  loading.value = true
  const q = (series: string) => `/nodes/${props.id}/metrics?${new URLSearchParams({ hours: String(hours.value), points: '360', series })}`
  try {
    const [a, b] = await Promise.all([api<History>(q('metrics'), ac.signal), api<History>(q('ping'), ac.signal)])
    metrics.value = a.metrics ?? []
    ping.value = { ping: b.ping ?? [], probes: b.probes ?? {}, loss: b.loss }
    error.value = ''
  }
  catch (e) {
    if ((e as Error).name !== 'AbortError') error.value = (e as Error).message
  }
  finally {
    if (controller === ac) loading.value = false
  }
}

watch([() => props.id, hours], load, { immediate: true })
const timer = setInterval(load, 60_000)
onBeforeUnmount(() => { clearInterval(timer); controller?.abort() })

// ---- charts ----

const times = computed(() => metrics.value.map(p => p.ts * 1000))
const range = computed(() => {
  const to = Date.now()
  return { from: to - hours.value * 3600_000, to }
})
const ticks = computed(() => times.value.length ? timeTicks(times.value[0]!, times.value.at(-1)!, 5) : [])
const xFormat = computed(() => clockFor(hours.value))

const pct = (v: number) => `${Math.round(v)}%`
const cpuSeries = computed(() => [{ name: 'CPU', color: '--green', values: metrics.value.map(p => p.cpu) }])
const cpuTop = computed(() => axisTop(Math.max(0, ...metrics.value.map(p => p.cpu)), 20, 10, 100))

const memSeries = computed(() => [{ name: '内存', color: '--blue', values: metrics.value.map(p => p.mem_used) }])
const diskSeries = computed(() => [{ name: '磁盘', color: '--yellow', values: metrics.value.map(p => p.disk_used) }])
const byteAxis = (v: number) => bytes(v, v >= 1024 ** 3 ? 1 : 0)

const netSeries = computed(() => [
  { name: '下载', color: '--green', values: metrics.value.map(p => p.net_rx) },
  { name: '上传', color: '--blue', values: metrics.value.map(p => p.net_tx) },
])
const netTop = computed(() => axisTop(Math.max(0, ...metrics.value.flatMap(p => [p.net_rx, p.net_tx])), 1024 * 16, 1024))
const netAxis = (v: number) => rate(v).replace('.0', '')

const PING_COLORS = ['--green', '--blue', '--yellow', '--purple', '--red']
/** Every probe on one shared time axis; a probe missing at a timestamp is a gap. */
const pingChart = computed(() => {
  const ids = Object.keys(ping.value.probes)
  const stamps = [...new Set(ping.value.ping.map(p => p.ts))].sort((a, b) => a - b)
  const index = new Map(stamps.map((t, i) => [t, i]))
  const series = ids.map((id, i) => {
    const values: (number | null)[] = Array.from({ length: stamps.length }, () => null)
    for (const p of ping.value.ping) if (String(p.task_id) === id) values[index.get(p.ts)!] = p.latency
    const ok = values.filter((v): v is number => v !== null)
    return {
      name: ping.value.probes[id]!,
      color: PING_COLORS[i % PING_COLORS.length]!,
      values,
      avg: ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : null,
      loss: ping.value.loss?.[id] ?? 0,
    }
  })
  const times = stamps.map(t => t * 1000)
  const max = Math.max(0, ...series.flatMap(s => s.values.filter((v): v is number => v !== null)))
  return {
    series,
    times,
    top: axisTop(max, 50),
    ticks: times.length ? timeTicks(times[0]!, times.at(-1)!, 5) : [],
  }
})
const ms = (v: number) => `${Math.round(v)}ms`

// ---- facts ----

const days = computed(() => node.value ? expiresIn(node.value) : null)
const facts = computed(() => {
  const n = node.value
  if (!n) return []
  return [
    ['系统', osName(n.os) || '—'],
    ['内核', n.kernel || '—'],
    ['架构', [n.arch, n.virt].filter(Boolean).join(' / ') || '—'],
    ['CPU', n.cpu_name && n.cpu_name.toLowerCase() !== 'unknown' ? `${cpuName(n.cpu_name)} × ${n.cpu_cores}` : `${n.cpu_cores} 核`],
    ['负载', m.value ? m.value.load.map(v => v.toFixed(2)).join(' / ') : '—'],
    ['连接', m.value ? `TCP ${m.value.tcp} · UDP ${m.value.udp}` : '—'],
    ['进程', m.value ? String(m.value.procs) : '—'],
    ['在线', m.value ? uptime(m.value.uptime) : '离线'],
    ['本月', `↓${bytes(n.month_rx)} ↑${bytes(n.month_tx)}${n.traffic_limit > 0 ? ` · ${pair(trafficUsed(n), n.traffic_limit)}` : ''}`],
    ['累计', `↓${bytes(n.total_rx)} ↑${bytes(n.total_tx)}`],
    ['价格', n.price > 0 ? `${money(n.price, n.currency)} / ${CYCLES[n.billing_cycle] ?? n.billing_cycle}` : '—'],
    ['到期', days.value === null ? '长期' : days.value < 0 ? `已过期 ${-days.value} 天` : [n.expires_at?.slice(0, 10), `剩 ${days.value} 天`].filter(Boolean).join(' · ')],
    ['Agent', n.agent_version || '—'],
  ] as const
})
</script>

<template>
  <div class="detail">
    <RouterLink to="/" class="btn back"><PixelIcon name="back" :size="14" />返回</RouterLink>

    <p v-if="!nodes" class="box skeleton ghost" />
    <p v-else-if="!node" class="empty">
      <span class="display">404</span>
      <span>节点不存在或未公开</span>
    </p>

    <template v-else>
      <section class="head box">
        <div class="title">
          <i class="dot" :class="{ on: node.online }" />
          <h1>{{ node.name }}</h1>
          <span v-if="node.country" class="badge display">{{ node.country }}</span>
          <span v-if="node.group && node.group !== node.country" class="badge">{{ node.group }}</span>
        </div>
        <p v-if="node.public_remark" class="remark muted">{{ node.public_remark }}</p>

        <div class="live">
          <div class="meter">
            <span class="display">CPU</span>
            <PixelBar :value="m?.cpu ?? 0" :cells="20" />
            <span class="num">{{ (m?.cpu ?? 0).toFixed(1) }}%</span>
          </div>
          <div class="meter">
            <span class="display">RAM</span>
            <PixelBar :value="percent(m?.mem_used ?? 0, node.mem_total)" :cells="20" />
            <span class="num">{{ pair(m?.mem_used ?? 0, node.mem_total) }}</span>
          </div>
          <div v-if="node.swap_total > 0" class="meter">
            <span class="display">SWP</span>
            <PixelBar :value="percent(m?.swap_used ?? 0, node.swap_total)" :cells="20" />
            <span class="num">{{ pair(m?.swap_used ?? 0, node.swap_total) }}</span>
          </div>
          <div class="meter">
            <span class="display">DSK</span>
            <PixelBar :value="percent(m?.disk_used ?? 0, node.disk_total)" :cells="20" />
            <span class="num">{{ pair(m?.disk_used ?? 0, node.disk_total) }}</span>
          </div>
          <div class="meter net">
            <span class="display">NET</span>
            <span class="num">
              <PixelIcon name="down" :size="12" class="rx" />{{ rate(m?.net_rx ?? 0) }}
              <PixelIcon name="up" :size="12" class="tx" />{{ rate(m?.net_tx ?? 0) }}
            </span>
          </div>
        </div>

        <dl class="facts">
          <div v-for="[k, v] in facts" :key="k">
            <dt class="muted">{{ k }}</dt>
            <dd>{{ v }}</dd>
          </div>
        </dl>
      </section>

      <div class="ranges">
        <button
          v-for="r in RANGES" :key="r.hours" class="btn display"
          :aria-pressed="hours === r.hours" @click="hours = r.hours"
        >
          {{ r.label }}
        </button>
        <span v-if="loading" class="muted display">LOADING…</span>
        <span v-else-if="error" class="err">{{ error }}</span>
      </div>

      <div class="charts">
        <section class="box panel">
          <h2 class="display">CPU</h2>
          <PixelChart :times="times" :series="cpuSeries" :top="cpuTop" :format="pct" :x-format="xFormat" :ticks="ticks" />
        </section>
        <section class="box panel">
          <h2 class="display">MEMORY</h2>
          <PixelChart :times="times" :series="memSeries" :top="node.mem_total" :format="byteAxis" :x-format="xFormat" :ticks="ticks" />
        </section>
        <section class="box panel">
          <h2 class="display">NETWORK</h2>
          <PixelChart :times="times" :series="netSeries" :top="netTop" :format="netAxis" :x-format="xFormat" :ticks="ticks" :fill="false" />
        </section>
        <section class="box panel">
          <h2 class="display">DISK</h2>
          <PixelChart :times="times" :series="diskSeries" :top="node.disk_total" :format="byteAxis" :x-format="xFormat" :ticks="ticks" />
        </section>
        <section v-if="pingChart.series.length" class="box panel wide">
          <h2 class="display">PING</h2>
          <ul class="legend">
            <li v-for="s in pingChart.series" :key="s.name">
              <i :style="{ background: `var(${s.color})` }" />
              <span>{{ s.name }}</span>
              <span class="muted num">{{ s.avg === null ? '—' : ms(s.avg) }} · 丢包 {{ s.loss > 0 && s.loss < 1 ? '<1' : Math.round(s.loss) }}%</span>
            </li>
          </ul>
          <PixelChart
            :times="pingChart.times" :series="pingChart.series" :top="pingChart.top" :format="ms"
            :x-format="xFormat" :ticks="pingChart.ticks" :fill="false" :height="200"
          />
        </section>
      </div>
      <p v-if="!metrics.length && !loading" class="muted hint">该时间范围内没有历史数据（{{ fullClock(range.from) }} 起）</p>
    </template>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
}

.back {
  align-self: flex-start;
}

.ghost {
  height: 280px;
  margin: 0;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 64px 0;
  color: var(--muted);
}

.empty .display {
  font-size: 48px;
  color: var(--ink);
}

.head {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

h1 {
  margin: 0;
  font-size: 24px;
  font-weight: normal;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.remark {
  margin: -8px 0 0;
  white-space: pre-wrap;
}

.live {
  display: grid;
  align-content: start;
  gap: 12px;
}

.meter {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.meter > .num {
  min-width: 110px;
  text-align: right;
}

.meter.net > .num {
  grid-column: 2 / 4;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
}

.rx {
  color: var(--green);
}

.tx {
  color: var(--blue);
  margin-left: 12px;
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
  gap: 10px 20px;
  margin: 0;
  padding-top: 14px;
  border-top: 2px dashed var(--track);
}

.facts div {
  min-width: 0;
}

dt {
  font-size: 12px;
}

dd {
  margin: 0;
  overflow-wrap: anywhere;
}

@media (min-width: 900px) {
  .head {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
    column-gap: 28px;
  }

  .title,
  .remark {
    grid-column: 1 / -1;
  }

  .facts {
    padding-top: 0;
    padding-left: 24px;
    border-top: 0;
    border-left: 2px dashed var(--track);
  }
}

.ranges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.err {
  color: var(--red);
}

.charts {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .charts {
    grid-template-columns: 1fr 1fr;
  }

  .wide {
    grid-column: 1 / -1;
  }
}

.panel {
  min-width: 0;
  padding: 12px 14px 8px;
}

h2 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: normal;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend i {
  width: 10px;
  height: 10px;
  box-shadow: 0 0 0 2px var(--ink);
}

.hint {
  margin: 0;
  text-align: center;
}
</style>
