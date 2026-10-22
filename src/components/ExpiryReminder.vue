<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { config } from '@/api/config'
import type { Node } from '@/api/types'
import { expiryReminders } from '@/lib/expiry'
import PixelIcon from './PixelIcon.vue'

const props = defineProps<{ nodes: Node[], group: string | null }>()
const reminders = computed(() => expiryReminders(props.nodes, config.value.expiryReminderDays))
const visible = computed(() => reminders.value.upcoming.length + reminders.value.expired.length > 0)
const showAll = ref(false)
const showExpired = ref(false)
const sections = computed(() => [
  { id: 'upcoming-expiry-nodes', entries: showAll.value ? reminders.value.upcoming : reminders.value.upcoming.slice(0, 3), show: true, label: '即将到期节点' },
  { id: 'expired-nodes', entries: reminders.value.expired, show: showExpired.value, label: '已到期节点' },
])

watch([() => props.group, () => reminders.value.days, visible], () => {
  showAll.value = false
  showExpired.value = false
})
</script>

<template>
  <section v-if="visible" class="expiry-reminder" aria-labelledby="expiry-reminder-title">
    <header class="expiry-heading">
      <PixelIcon name="bell" :size="18" class="bell" />
      <h3 id="expiry-reminder-title">到期提醒</h3>
      <span v-if="reminders.upcoming.length" class="expiry-count">{{ reminders.upcoming.length }} 台</span>
      <span class="expiry-scope muted">未来 {{ reminders.days }} 天内 · 按到期时间排序</span>
    </header>

    <template v-for="section in sections" :key="section.id">
      <div v-if="section.id === 'expired-nodes' && reminders.expired.length" class="expired-heading">
        <button class="expiry-toggle expired-toggle" type="button" :aria-expanded="showExpired" aria-controls="expired-nodes" @click="showExpired = !showExpired">
          已到期 {{ reminders.expired.length }} 台 <span aria-hidden="true">{{ showExpired ? '▴' : '▾' }}</span>
        </button>
      </div>
      <ul v-if="section.entries.length" v-show="section.show" :id="section.id" class="expiry-nodes" :aria-label="section.label">
        <li v-for="entry in section.entries" :key="entry.node.id">
          <RouterLink :to="`/node/${entry.node.id}`" class="expiry-node">
            <span class="expiry-node-heading"><span class="expiry-node-name">{{ entry.node.name }}</span><span aria-hidden="true">›</span></span>
            <span class="expiry-node-footer">
              <span class="expiry-badge" :class="{ urgent: entry.days === 0, expired: entry.days < 0 }">
                {{ entry.days < 0 ? '已到期' : entry.days === 0 ? '今天到期' : `剩余 ${entry.days} 天` }}
              </span>
              <time v-if="entry.node.expires_at" :datetime="entry.node.expires_at.slice(0, 10)" :title="entry.node.expires_at.slice(0, 10)" class="muted num">{{ entry.node.expires_at.slice(5, 10) }}</time>
            </span>
          </RouterLink>
        </li>
      </ul>
      <div v-if="section.id === 'upcoming-expiry-nodes' && reminders.upcoming.length > 3" class="expiry-more">
        <button class="expiry-toggle" type="button" :aria-expanded="showAll" aria-controls="upcoming-expiry-nodes" @click="showAll = !showAll">
          {{ showAll ? '收起' : `查看全部 ${reminders.upcoming.length} 台` }} <span aria-hidden="true">{{ showAll ? '▴' : '▾' }}</span>
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.expiry-reminder {
  --expiry-ink: #72500a;
  --expiry-border: #b79d61;
  --expiry-fill: #f5e2a5;
  --expiry-urgent: #a63b32;
  --expiry-urgent-fill: #f8ded6;
  padding: 14px 20px 16px;
  border-top: 2px solid var(--track);
  background: color-mix(in srgb, var(--yellow) 7%, var(--panel));
}

:root.dark .expiry-reminder {
  --expiry-ink: #f2d58d;
  --expiry-border: #8e7945;
  --expiry-fill: #4b3c20;
  --expiry-urgent: #ffb6aa;
  --expiry-urgent-fill: #552d2a;
}

.expiry-heading, .expiry-node-heading, .expiry-node-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expiry-heading { flex-wrap: wrap; margin-bottom: 12px; }
.bell { color: var(--expiry-ink); flex: none; }
h3 { margin: 0; font-size: 16px; font-weight: normal; }
.expiry-count { border: 1px solid var(--expiry-border); padding: 0 5px; color: var(--expiry-ink); background: var(--expiry-fill); }
.expiry-scope { margin-left: auto; }
.expiry-nodes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; list-style: none; margin: 0; padding: 0; }
.expiry-nodes li { min-width: 0; }
.expiry-node { display: flex; flex-direction: column; justify-content: space-between; gap: 10px; height: 100%; padding: 10px 12px; border: 2px solid var(--expiry-border); background: var(--panel); text-decoration: none; }
.expiry-node:hover { background: color-mix(in srgb, var(--yellow) 10%, var(--panel)); box-shadow: 2px 2px 0 var(--expiry-border); }
.expiry-node-heading, .expiry-node-footer { justify-content: space-between; }
.expiry-node-heading { align-items: flex-start; }
.expiry-node-name { min-width: 0; overflow-wrap: anywhere; }
.expiry-node-footer { flex-wrap: wrap; }
.expiry-badge { color: var(--expiry-ink); background: var(--expiry-fill); padding: 1px 5px; }
.expiry-badge.urgent { color: var(--expiry-urgent); background: var(--expiry-urgent-fill); }
.expiry-badge.expired { color: #fffdf7; background: #a63b32; }
.expiry-more { display: flex; justify-content: flex-end; margin-top: 8px; }
.expiry-toggle { min-height: 32px; padding: 4px 8px; border: 1px solid var(--expiry-border); background: var(--panel); color: var(--expiry-ink); cursor: pointer; }
.expiry-toggle:hover { background: var(--expiry-fill); }
.expired-heading { margin-top: 12px; }
.expired-toggle { color: var(--expiry-urgent); border-color: var(--expiry-urgent); }
.expired-heading + .expiry-nodes { margin-top: 10px; }

@media (max-width: 719px) {
  .expiry-reminder { padding: 12px; }
  .expiry-nodes { grid-template-columns: 1fr; }
  .expiry-scope { flex-basis: 100%; margin-left: 0; }
  .expiry-toggle { min-height: 44px; }
}
</style>
