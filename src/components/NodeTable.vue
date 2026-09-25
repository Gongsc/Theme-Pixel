<script setup lang="ts">
import { useRouter } from 'vue-router'
import { latencyColor, type Probe } from '@/api/ping'
import type { Node } from '@/api/types'
import { ago, bytes, expiresIn, percent, rate, trafficUsed, uptime } from '@/lib/format'
import PixelBar from './PixelBar.vue'

defineProps<{ nodes: Node[], pings?: Map<number, Probe[]> }>()
const router = useRouter()

const live = (n: Node) => (n.online ? n.metrics : null)
</script>

<template>
  <div class="box scroller">
    <table>
      <thead>
        <tr class="display">
          <th>NODE</th>
          <th>CPU</th>
          <th>RAM</th>
          <th>DISK</th>
          <th>↓ / ↑</th>
          <th v-if="pings">PING</th>
          <th>MONTH</th>
          <th>UPTIME</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in nodes" :key="n.id" :class="{ off: !n.online }" @click="router.push(`/node/${n.id}`)">
          <td class="name">
            <i class="dot" :class="{ on: n.online }" />
            <RouterLink :to="`/node/${n.id}`" @click.stop>{{ n.name }}</RouterLink>
            <span v-if="n.country" class="badge display">{{ n.country }}</span>
            <span v-if="(expiresIn(n) ?? Infinity) < 0" class="badge dead">已过期</span>
          </td>
          <template v-if="live(n)">
            <td><div class="cell"><PixelBar :value="live(n)!.cpu" :cells="8" /><span class="num">{{ live(n)!.cpu.toFixed(0) }}%</span></div></td>
            <td><div class="cell"><PixelBar :value="percent(live(n)!.mem_used, n.mem_total)" :cells="8" /><span class="num">{{ percent(live(n)!.mem_used, n.mem_total).toFixed(0) }}%</span></div></td>
            <td><div class="cell"><PixelBar :value="percent(live(n)!.disk_used, n.disk_total)" :cells="8" /><span class="num">{{ percent(live(n)!.disk_used, n.disk_total).toFixed(0) }}%</span></div></td>
            <td class="num">{{ rate(live(n)!.net_rx) }} / {{ rate(live(n)!.net_tx) }}</td>
          </template>
          <td v-if="pings && live(n)" class="lat num">
            <span
              v-for="p in (pings.get(n.id) ?? []).slice(0, 4)" :key="p.id"
              :title="`${p.name} · 丢包 ${Math.round(p.loss)}%`" :style="{ color: latencyColor(p.latest) }"
            >{{ p.latest === null ? '×' : Math.round(p.latest) }}</span>
            <span v-if="!pings.get(n.id)?.length" class="muted">—</span>
          </td>
          <td v-else-if="!live(n)" :colspan="pings ? 5 : 4" class="gone">OFFLINE · {{ ago(n.last_seen) }}</td>
          <td class="num">{{ bytes(trafficUsed(n)) }}<span v-if="n.traffic_limit > 0" class="muted"> / {{ bytes(n.traffic_limit) }}</span></td>
          <td class="num">{{ live(n) ? uptime(live(n)!.uptime) : '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.scroller {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
}

th,
td {
  padding: 8px 12px;
  text-align: left;
  white-space: nowrap;
}

th {
  font-size: 12px;
  font-weight: normal;
  border-bottom: var(--b) solid var(--ink);
}

tbody tr {
  cursor: pointer;
}

tbody tr + tr td {
  border-top: 2px dashed var(--track);
}

tbody tr:hover {
  background: var(--track);
}

tr.off {
  color: var(--muted);
}

.name {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 320px;
}

.name a {
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}

.cell {
  display: grid;
  grid-template-columns: 88px 36px;
  align-items: center;
  gap: 8px;
}

.cell span {
  text-align: right;
}

.gone {
  color: var(--red);
}

.lat span + span::before {
  content: ' / ';
  color: var(--muted);
}

.badge.dead {
  border-color: var(--ink);
  background: var(--red);
  color: #fff;
}
</style>
