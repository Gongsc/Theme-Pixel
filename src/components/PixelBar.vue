<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ value: number, cells?: number, color?: string }>(), { cells: 10 })

/** Filled cells, rounding up so any non-zero load shows at least one block. */
const lit = computed(() => Math.min(props.cells, Math.ceil((Math.max(0, props.value) / 100) * props.cells)))
const tone = computed(() => props.color ?? (props.value >= 90 ? 'var(--red)' : props.value >= 70 ? 'var(--yellow)' : 'var(--green)'))
</script>

<template>
  <div class="bar" role="meter" :aria-valuenow="Math.round(value)" aria-valuemin="0" aria-valuemax="100" :style="{ '--n': cells }">
    <i v-for="i in cells" :key="i" :style="i <= lit ? { background: tone } : undefined" />
  </div>
</template>

<style scoped>
.bar {
  display: grid;
  grid-template-columns: repeat(var(--n), 1fr);
  gap: 2px;
  height: 12px;
  padding: 2px;
  border: 2px solid var(--ink);
  background: var(--panel);
}

i {
  background: var(--track);
}
</style>
