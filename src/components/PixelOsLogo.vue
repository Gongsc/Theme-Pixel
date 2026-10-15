<script lang="ts">
const assets = import.meta.glob<string>('../assets/os/*.{svg,webp}', {
  query: '?no-inline',
  import: 'default',
  eager: true,
})
const urls = new Map(Object.entries(assets).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url]))
const cache = new Map<string, Promise<string>>()
const PIXELS = 28

/** Each local logo is rasterized once and shared by every node using that OS. */
function logoFor(id: string): Promise<string> | undefined {
  const url = urls.get(id)
  if (!url) return undefined
  let promise = cache.get(id)
  if (!promise) {
    promise = new Promise<string>((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = PIXELS
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Canvas unavailable')
          const scale = PIXELS / Math.max(image.naturalWidth, image.naturalHeight)
          const width = image.naturalWidth * scale
          const height = image.naturalHeight * scale
          context.drawImage(image, (PIXELS - width) / 2, (PIXELS - height) / 2, width, height)
          resolve(canvas.toDataURL())
        }
        catch (error) { reject(error) }
      }
      image.onerror = () => reject(new Error('OS logo unavailable'))
      image.src = url
    }).catch(error => { cache.delete(id); throw error })
    cache.set(id, promise)
  }
  return promise
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { osLogo } from '@/lib/os-logo'

const props = withDefaults(defineProps<{ os: string, online?: boolean }>(), { online: true })
const logo = computed(() => osLogo(props.os))
const src = ref('')

watch(() => logo.value.id, (id, _, onCleanup) => {
  let active = true
  onCleanup(() => { active = false })
  src.value = ''
  const promise = logoFor(id)
  promise?.then(value => { if (active) src.value = value })
    .catch(() => { /* Keep the generic server glyph if an asset fails. */ })
}, { immediate: true })
</script>

<template>
  <span class="os-logo" :class="{ 'logo-offline': !online, 'logo-monochrome': logo.id === 'apple' }" :title="logo.label" aria-hidden="true">
    <img v-if="src" :src="src" width="28" height="28" alt="" @error="src = ''">
    <svg v-else viewBox="0 0 14 14" width="28" height="28" shape-rendering="crispEdges" focusable="false">
      <path fill="currentColor" fill-rule="evenodd" d="M1 1h12v5H1zM1 8h12v5H1zM3 3h2v1H3zM7 3h4v1H7zM3 10h2v1H3zM7 10h4v1H7z" />
    </svg>
  </span>
</template>

<style scoped>
.os-logo {
  display: inline-flex;
  flex: none;
  width: 32px;
  height: 32px;
  box-sizing: border-box;
  padding: 2px;
  color: var(--muted);
}
.os-logo img, .os-logo svg { display: block; image-rendering: pixelated; }
.dark .logo-monochrome img { filter: invert(1); }
.logo-offline { filter: grayscale(1); opacity: .65; }
</style>
