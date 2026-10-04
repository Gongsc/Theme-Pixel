<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/api/types'

const props = defineProps<{ node: Pick<Node, 'public_remark' | 'remark'> }>()

const COLORS = ['--green', '--blue', '--yellow', '--purple', '--red']

/**
 * The public remark, which every visitor receives from hub 1.3.2 on. An older
 * hub has none, and only its private remark, sent to a signed-in admin.
 * Either semicolon splits; the note is typed with a Chinese keyboard as often as not.
 */
const tags = computed(() => {
  const text = props.node.public_remark ?? props.node.remark ?? ''
  return [...new Set(text.split(/[;；]/).map(s => s.trim()).filter(Boolean))]
})

/** A tag keeps its colour wherever it appears. */
function color(tag: string): string {
  let h = 0
  for (const c of tag) h = (h * 31 + c.codePointAt(0)!) >>> 0
  return `var(${COLORS[h % COLORS.length]})`
}
</script>

<template>
  <ul v-if="tags.length" class="tags">
    <li v-for="t in tags" :key="t">
      <i :style="{ background: color(t) }" />{{ t }}
    </li>
  </ul>
</template>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  padding: 0 6px 0 4px;
  border: 2px solid var(--ink);
  background: var(--bg);
  font-size: 12px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

i {
  flex: none;
  width: 6px;
  height: 6px;
}
</style>
