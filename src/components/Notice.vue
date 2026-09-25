<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <!-- Plain text only: the hub forbids injecting administrator HTML. -->
  <div class="box notice" role="note">
    <span class="tag display">!</span>
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--yellow) 22%, var(--panel));
}

.tag {
  display: grid;
  place-items: center;
  flex: none;
  width: 24px;
  height: 24px;
  background: var(--yellow);
  color: #1b1b1f;
  border: 2px solid var(--ink);
  font-size: 16px;
}

p {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  align-self: center;
}
</style>
