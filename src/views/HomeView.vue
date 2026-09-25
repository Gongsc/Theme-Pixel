<script lang="ts">
import { ref } from 'vue'

// Module-level so the tab, search and layout survive a visit to a node page.
const group = ref<string | null>(null)
const query = ref('')
const layout = ref<'grid' | 'list' | null>(null)
</script>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { config } from '@/api/config'
import { nodes, nodesError } from '@/api/nodes'
import { pings, usePings } from '@/api/ping'
import GroupTabs from '@/components/GroupTabs.vue'
import NodeCard from '@/components/NodeCard.vue'
import NodeTable from '@/components/NodeTable.vue'
import Notice from '@/components/Notice.vue'
import PixelIcon from '@/components/PixelIcon.vue'
import Summary from '@/components/Summary.vue'

const all = computed(() => (nodes.value ?? []).filter(n => n.online || !config.value.hideOffline))

/** Every group in use, ordered by the first node carrying it: the operator's node order decides. */
const groups = computed(() => [...new Set(all.value.map(n => n.group ?? '').filter(Boolean))])
const ungrouped = computed(() => all.value.filter(n => !n.group).length)
const tabs = computed(() => [
  { value: null, label: '全部', count: all.value.length },
  ...groups.value.map(g => ({ value: g, label: g, count: all.value.filter(n => n.group === g).length })),
  ...(ungrouped.value ? [{ value: '', label: '未分组', count: ungrouped.value }] : []),
])

// A tab that has emptied or been renamed falls back to every node.
watch(tabs, (t) => { if (!t.some(x => x.value === group.value)) group.value = null })

const inGroup = computed(() => group.value === null ? all.value : all.value.filter(n => (n.group ?? '') === group.value))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = q
    ? inGroup.value.filter(n => [n.name, n.country, n.os, n.group ?? ''].some(s => s.toLowerCase().includes(q)))
    : inGroup.value
  // Offline nodes sink, keeping the operator's order within each half.
  return [...list].sort((a, b) => Number(b.online) - Number(a.online))
})

const view = computed(() => layout.value ?? config.value.cardLayout)

usePings()
const probesOf = (id: number) => config.value.showPing ? pings.value.get(id)?.slice(0, config.value.pingProbes) : undefined
</script>

<template>
  <div class="home">
    <Notice v-if="config.notice.trim()" :text="config.notice.trim()" />
    <p v-if="nodesError" class="err" role="alert">{{ nodesError }}</p>

    <template v-if="nodes">
      <GroupTabs v-if="groups.length" v-model="group" :tabs="tabs" />
      <Summary v-if="config.showSummary" :nodes="inGroup" :group="group" />

      <div class="tools">
        <label class="search">
          <span class="display">&gt;</span>
          <input v-model="query" class="input" type="search" placeholder="搜索节点 / 地区 / 系统" aria-label="搜索节点">
        </label>
        <div class="grow" />
        <button class="btn icon" title="卡片" :aria-pressed="view === 'grid'" @click="layout = 'grid'">
          <PixelIcon name="grid" :size="16" />
        </button>
        <button class="btn icon" title="列表" :aria-pressed="view === 'list'" @click="layout = 'list'">
          <PixelIcon name="list" :size="16" />
        </button>
      </div>

      <p v-if="!all.length" class="empty display">NO NODES YET</p>
      <p v-else-if="!shown.length" class="empty">没有匹配的节点</p>
      <div v-else-if="view === 'grid'" class="grid">
        <NodeCard v-for="n in shown" :key="n.id" :node="n" :show-price="config.showPrice" :probes="probesOf(n.id)" />
      </div>
      <NodeTable v-else :nodes="shown" :pings="config.showPing ? pings : undefined" />
    </template>

    <div v-else class="grid">
      <div v-for="i in 4" :key="i" class="box skeleton ghost" />
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 20px;
}

.err {
  margin: 0;
  color: var(--red);
}

.tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 360px;
}

.search .input {
  flex: 1;
}

.grow {
  flex: 1;
}

.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  align-items: stretch;
}

.ghost {
  height: 220px;
}

.empty {
  margin: 48px 0;
  text-align: center;
  color: var(--muted);
  font-size: 16px;
}
</style>
