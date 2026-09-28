<script lang="ts">
// Emitted as separate files, never inlined: the map in the bundle holds only
// URLs, and a visitor fetches just the flags on the page.
const FLAGS = import.meta.glob<string>('/node_modules/flag-icons/flags/4x3/[a-z][a-z].svg', {
  query: '?no-inline',
  import: 'default',
  eager: true,
})

const urls = new Map(Object.entries(FLAGS).map(([path, url]) => [path.split('/').pop()!.slice(0, 2).toUpperCase(), url]))

/** Rasterized once per country, shared by every card. */
const cache = new Map<string, Promise<string>>()

const W = 12
const H = 9

function pixelate(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      canvas.getContext('2d')!.drawImage(img, 0, 0, W, H)
      resolve(canvas.toDataURL())
    }
    img.onerror = reject
    img.src = url
  })
}

function flagFor(code: string): Promise<string> | undefined {
  const url = urls.get(code)
  if (!url) return undefined
  let p = cache.get(code)
  if (!p) cache.set(code, p = pixelate(url))
  return p
}
</script>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{ code: string }>()

const src = ref('')
const failed = ref(false)

watchEffect(() => {
  const code = props.code.toUpperCase()
  src.value = ''
  failed.value = false
  const p = flagFor(code)
  if (!p) { failed.value = true; return }
  p.then((s) => { if (props.code.toUpperCase() === code) src.value = s })
    .catch(() => { failed.value = true })
})
</script>

<template>
  <!-- A code with no flag (or a failed load) keeps the text badge. -->
  <span v-if="failed" class="badge display">{{ code }}</span>
  <img v-else-if="src" class="flag" :src="src" :alt="code" :title="code" width="24" height="18">
  <span v-else class="flag" aria-hidden="true" />
</template>

<style scoped>
.flag {
  display: block;
  flex: none;
  box-sizing: content-box;
  width: 24px;
  height: 18px;
  border: 2px solid var(--ink);
  background: var(--track);
  image-rendering: pixelated;
}
</style>
