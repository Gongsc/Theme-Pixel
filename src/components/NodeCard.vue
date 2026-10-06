<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/api/types'
import { ago, bytes, cycle, expiresIn, money, osName, pair, percent, rate, trafficUsed, uptime } from '@/lib/format'
import type { Probe } from '@/api/ping'
import NodeTags from './NodeTags.vue'
import PingRows from './PingRows.vue'
import PixelBar from './PixelBar.vue'
import PixelFlag from './PixelFlag.vue'
import PixelIcon from './PixelIcon.vue'
import PixelGuardian from './PixelGuardian.vue'
import { runtimeProgress } from '@/lib/runtime'

const props = defineProps<{ node: Node, showPrice: boolean, probes?: Probe[] }>()

const m = computed(() => (props.node.online ? props.node.metrics : null))
const cpu = computed(() => m.value?.cpu ?? 0)
const mem = computed(() => percent(m.value?.mem_used ?? 0, props.node.mem_total))
const disk = computed(() => percent(m.value?.disk_used ?? 0, props.node.disk_total))
const used = computed(() => trafficUsed(props.node))
const days = computed(() => expiresIn(props.node))
const runtime = computed(() => m.value ? runtimeProgress(m.value.uptime) : null)
</script>

<template>
  <RouterLink :to="`/node/${node.id}`" class="card box" :class="{ off: !node.online }">
    <header>
      <PixelGuardian :size="28" :online="node.online" class="guardian" />
      <h3 :title="node.name">{{ node.name }}</h3>
      <span class="status display" :class="{ connected: node.online }">{{ node.online ? 'ONLINE' : 'OFFLINE' }}</span>
      <PixelFlag v-if="node.country" :code="node.country" />
    </header>
    <p class="sub muted">{{ [osName(node.os), node.arch, node.virt].filter(Boolean).join(' · ') || '—' }}</p>
    <NodeTags :node="node" class="tags" />

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
    </template>
    <div v-else class="offline display">
      <PixelIcon v-if="!node.online" name="alert" :size="26" />
      <span>{{ node.online ? 'WAITING' : 'OFFLINE' }}</span>
      <small class="muted">{{ node.online ? '等待指标上报' : `最后在线：${ago(node.last_seen)}` }}</small>
    </div>

    <div v-if="node.traffic_limit > 0" class="meter traffic">
      <span class="k display">NET</span>
      <PixelBar :value="percent(used, node.traffic_limit)" :cells="10" color="var(--purple)" />
      <span class="v num">{{ pair(used, node.traffic_limit) }}</span>
    </div>
    <div v-else class="meta muted num">本月 ↓{{ bytes(node.month_rx) }} ↑{{ bytes(node.month_tx) }}</div>

    <template v-if="m">
      <div class="net num">
        <span><PixelIcon name="down" :size="12" class="rx" />{{ rate(m.net_rx) }}</span>
        <span><PixelIcon name="up" :size="12" class="tx" />{{ rate(m.net_tx) }}</span>
      </div>

      <PingRows v-if="probes?.length" :probes="probes" class="pings" />
    </template>

    <section
      v-if="runtime && m" class="runtime"
      title="等级按本次系统运行的完整天数计算，每运行 24 小时升一级；系统重启后重新累计。"
      aria-label="本次系统运行经验"
    >
      <div class="experience">
        <span>运行经验</span>
        <PixelBar :value="runtime.progress" :cells="12" color="var(--purple)" :aria-label="`距下一级已完成 ${Math.floor(runtime.progress)}%`" />
        <span class="level badge display num">LV.{{ runtime.label }}</span>
      </div>
      <div class="runtime-meta num">
        <span>运行 {{ m.uptime === 0 ? '0分' : uptime(m.uptime) }}</span>
        <span>下一级 {{ runtime.nextDays }}天</span>
      </div>
    </section>

    <footer class="muted">
      <span class="grow" />
      <span v-if="showPrice && node.price > 0" class="num">{{ money(node.price, node.currency) }} · {{ cycle(node.billing_cycle) }}</span>
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

.guardian {
  flex: none;
}

.status {
  flex: none;
  padding: 0 3px;
  background: #bd332e;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
}

.status.connected {
  background: var(--green);
  color: #101b13;
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
  margin: -4px 0 2px 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  margin: -2px 0 2px 36px;
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

.pings {
  margin-top: -4px;
  padding-bottom: 4px;
  border-bottom: 2px dashed var(--track);
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

.runtime {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
  margin-top: auto;
  border-top: 2px dashed var(--track);
}

.experience {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.level {
  color: var(--purple);
}

.runtime-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 8px;
}

.offline small {
  font-family: var(--font);
  font-size: 12px;
}

footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  font-size: 12px;
  flex-wrap: wrap;
  min-height: 18px;
}

.off footer {
  margin-top: auto;
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
