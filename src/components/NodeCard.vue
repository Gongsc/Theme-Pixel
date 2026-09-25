<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/api/types'
import { ago, bytes, CYCLES, expiresIn, money, osName, pair, percent, rate, trafficUsed, uptime } from '@/lib/format'
import PixelBar from './PixelBar.vue'
import PixelIcon from './PixelIcon.vue'

const props = defineProps<{ node: Node, showPrice: boolean }>()

const m = computed(() => (props.node.online ? props.node.metrics : null))
const cpu = computed(() => m.value?.cpu ?? 0)
const mem = computed(() => percent(m.value?.mem_used ?? 0, props.node.mem_total))
const disk = computed(() => percent(m.value?.disk_used ?? 0, props.node.disk_total))
const used = computed(() => trafficUsed(props.node))
const days = computed(() => expiresIn(props.node))
</script>

<template>
  <RouterLink :to="`/node/${node.id}`" class="card box" :class="{ off: !node.online }">
    <header>
      <i class="dot" :class="{ on: node.online }" />
      <h3>{{ node.name }}</h3>
      <span v-if="node.country" class="badge display">{{ node.country }}</span>
    </header>
    <p class="sub muted">{{ [osName(node.os), node.arch, node.virt].filter(Boolean).join(' · ') || '—' }}</p>

    <template v-if="m">
      <div class="meter">
        <span class="k display">CPU</span>
        <PixelBar :value="cpu" />
        <span class="v num">{{ cpu.toFixed(1) }}%</span>
      </div>
      <div class="meter">
        <span class="k display">RAM</span>
        <PixelBar :value="mem" />
        <span class="v num">{{ pair(m.mem_used, node.mem_total) }}</span>
      </div>
      <div class="meter">
        <span class="k display">DSK</span>
        <PixelBar :value="disk" />
        <span class="v num">{{ pair(m.disk_used, node.disk_total) }}</span>
      </div>

      <div class="net num">
        <span><PixelIcon name="down" :size="12" class="rx" />{{ rate(m.net_rx) }}</span>
        <span><PixelIcon name="up" :size="12" class="tx" />{{ rate(m.net_tx) }}</span>
      </div>
    </template>
    <div v-else class="offline display">
      <span>OFFLINE</span>
      <small class="muted">{{ ago(node.last_seen) }}</small>
    </div>

    <div v-if="node.traffic_limit > 0" class="meter traffic">
      <span class="k display">NET</span>
      <PixelBar :value="percent(used, node.traffic_limit)" :cells="10" color="var(--purple)" />
      <span class="v num">{{ pair(used, node.traffic_limit) }}</span>
    </div>
    <div v-else class="meta muted num">本月 ↓{{ bytes(node.month_rx) }} ↑{{ bytes(node.month_tx) }}</div>

    <footer class="muted">
      <span v-if="m">UP {{ uptime(m.uptime) }}</span>
      <span class="grow" />
      <span v-if="showPrice && node.price > 0" class="num">{{ money(node.price, node.currency) }}/{{ CYCLES[node.billing_cycle] ?? node.billing_cycle }}</span>
      <span
        v-if="days !== null" class="badge"
        :class="{ warn: days <= 7 && days >= 0, dead: days < 0 }"
      >{{ days < 0 ? '已过期' : `${days}天` }}</span>
    </footer>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 12px 14px;
  color: inherit;
  text-decoration: none;
  transition: transform 80ms steps(2), box-shadow 80ms steps(2);
}

.card:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--shadow);
}

.card.off {
  background: repeating-linear-gradient(135deg, var(--panel) 0 6px, var(--bg) 6px 8px);
}

header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

h3 {
  flex: 1;
  margin: 0;
  overflow: hidden;
  font-size: var(--fs);
  font-weight: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub {
  margin: -4px 0 2px 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meter {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 8px;
}

.k {
  font-size: 12px;
}

.v {
  min-width: 78px;
  text-align: right;
  white-space: nowrap;
}

.net {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
  border-top: 2px dashed var(--track);
}

.net span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rx {
  color: var(--green);
}

.tx {
  color: var(--blue);
}

.offline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 90px;
  color: var(--red);
  font-size: 16px;
}

.offline small {
  font-family: var(--font);
  font-size: 12px;
}

footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 12px;
}

.grow {
  flex: 1;
}

.badge.warn,
.badge.dead {
  border-color: var(--ink);
  background: var(--yellow);
  color: #1b1b1f;
}

.badge.dead {
  background: var(--red);
  color: #fff;
}
</style>
