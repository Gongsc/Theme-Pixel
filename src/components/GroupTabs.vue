<script setup lang="ts">
defineProps<{ tabs: { value: string | null, label: string, count: number }[] }>()
const model = defineModel<string | null>({ required: true })
</script>

<template>
  <div role="group" aria-label="分组" class="tabs">
    <button
      v-for="t in tabs" :key="t.value === null ? '*' : `=${t.value}`"
      class="btn" :aria-pressed="model === t.value" @click="model = t.value"
    >
      {{ t.label }}<span class="count num">{{ t.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 4px 6px 2px;
  margin: 0 -4px 0 -2px;
}

.btn {
  flex: none;
}

.count {
  opacity: 0.6;
}
</style>
