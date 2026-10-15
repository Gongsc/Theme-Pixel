<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/api/types'
import { me } from '@/api/me'
import { remarkTags } from '@/lib/remarks'

const props = defineProps<{ node: Pick<Node, 'public_remark' | 'remark'> }>()

const COLORS = ['--green', '--blue', '--yellow', '--purple', '--red']

const tags = computed(() => remarkTags(props.node, me.value?.authed === true))

/** A tag keeps its colour wherever it appears. */
function color(tag: string): string {
  let h = 0
  for (const c of tag) h = (h * 31 + c.codePointAt(0)!) >>> 0
  return `var(${COLORS[h % COLORS.length]})`
}
</script>

<template>
  <ul v-if="tags.length" class="tags">
    <li v-for="tag in tags" :key="`${tag.private}:${tag.text}`" :class="{ private: tag.private }" :title="`${tag.private ? '私有备注（仅管理员可见）：' : '公开备注：'}${tag.text}`">
      <i :style="{ background: color(tag.text) }" aria-hidden="true" />
      {{ tag.text }}
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

.private { border-style: dashed; }

i {
  flex: none;
  width: 6px;
  height: 6px;
}
</style>
