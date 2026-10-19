<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { latencyColor, type Probe } from '@/api/ping'
import type { Node } from '@/api/types'
import { ago, bytes, expiresIn, percent, rate, trafficUsed, uptime } from '@/lib/format'
import { sortNodes, type SortDirection, type SortKey } from '@/lib/table-sort'
import PixelBar from './PixelBar.vue'
import NodeTags from './NodeTags.vue'

const props = defineProps<{ nodes: Node[], pings?: Map<number, Probe[]> }>()
const router = useRouter()
const sortKey = ref<SortKey | null>(null)
const direction = ref<SortDirection>('ascending')
const columns = computed(() => [
  { key: 'name', label: 'NODE', description: '节点名称' },
  { key: 'cpu', label: 'CPU', description: 'CPU 使用率' },
  { key: 'ram', label: 'RAM', description: '内存使用率' },
  { key: 'disk', label: 'DISK', description: '磁盘使用率' },
  { key: 'network', label: '↓ / ↑', description: '下载与上传速率合计' },
  ...(props.pings ? [{ key: 'ping', label: 'PING', description: '当前线路最新延迟均值（不含超时）' }] : []),
  { key: 'month', label: 'MONTH', description: '本月已用流量' },
  { key: 'uptime', label: 'UPTIME', description: '运行时长' },
] as { key: SortKey, label: string, description: string }[])
const sortedNodes = computed(() => sortKey.value && (sortKey.value !== 'ping' || props.pings)
  ? sortNodes(props.nodes, sortKey.value, direction.value, props.pings)
  : props.nodes)

function toggleSort(key: SortKey) {
  direction.value = sortKey.value === key && direction.value === 'ascending' ? 'descending' : 'ascending'
  sortKey.value = key
}

const live = (n: Node) => (n.online ? n.metrics : null)
</script>

<template>
  <div class="box scroller">
    <table>
      <thead>
        <tr class="display">
          <th v-for="column in columns" :key="column.key" scope="col" :aria-sort="sortKey === column.key ? direction : 'none'">
            <button
              type="button" class="sort-button"
              :title="`按${column.description}排序`"
              :aria-label="`按${column.description}${sortKey === column.key && direction === 'ascending' ? '降序' : '升序'}排序`"
              @click="toggleSort(column.key)"
            >
              {{ column.label }}
              <span class="sort-arrow" :class="{ active: sortKey === column.key }" aria-hidden="true">{{ sortKey === column.key ? (direction === 'ascending' ? '↑' : '↓') : '↕' }}</span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in sortedNodes" :key="n.id" :class="{ off: !n.online }" @click="router.push(`/node/${n.id}`)">
          <td class="name">
            <i class="dot" :class="{ on: n.online }" />
            <RouterLink :to="`/node/${n.id}`" @click.stop>{{ n.name }}</RouterLink>
            <span v-if="n.country" class="badge display">{{ n.country }}</span>
            <span v-if="(expiresIn(n) ?? Infinity) < 0" class="badge dead">已过期</span>
            <NodeTags :node="n" class="table-tags" />
          </td>
          <template v-if="live(n)">
            <td><div class="cell"><PixelBar :value="live(n)!.cpu" :cells="8" /><span class="num">{{ live(n)!.cpu.toFixed(0) }}%</span></div></td>
            <td><div class="cell"><PixelBar :value="percent(live(n)!.mem_used, n.mem_total)" :cells="8" /><span class="num">{{ percent(live(n)!.mem_used, n.mem_total).toFixed(0) }}%</span></div></td>
            <td><div class="cell"><PixelBar :value="percent(live(n)!.disk_used, n.disk_total)" :cells="8" /><span class="num">{{ percent(live(n)!.disk_used, n.disk_total).toFixed(0) }}%</span></div></td>
            <td class="num">{{ rate(live(n)!.net_rx) }} / {{ rate(live(n)!.net_tx) }}</td>
          </template>
          <td v-if="pings && live(n)" class="lat num">
            <span
              v-for="p in pings.get(n.id) ?? []" :key="p.id"
              :title="`${p.name} · 丢包 ${Math.round(p.loss)}%`" :style="{ color: latencyColor(p.latest) }"
            >{{ p.latest === null ? '×' : Math.round(p.latest) }}</span>
            <span v-if="!pings.get(n.id)?.length" class="muted">—</span>
          </td>
          <td v-else-if="!live(n)" :colspan="pings ? 5 : 4" class="gone">OFFLINE · {{ ago(n) }}</td>
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

.sort-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.sort-button:hover {
  color: var(--purple);
}

.sort-arrow {
  color: var(--muted);
}

.sort-arrow.active {
  color: var(--ink);
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
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: 320px;
}

.name a {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}

.table-tags { flex-basis: 100%; min-width: 0; }

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
