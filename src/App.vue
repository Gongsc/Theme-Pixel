<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { config, loadConfig } from '@/api/config'
import { loadMe, me } from '@/api/me'
import { live, nodes, nodesClosed, startNodes } from '@/api/nodes'
import PixelIcon from '@/components/PixelIcon.vue'
import PixelGuardian from '@/components/PixelGuardian.vue'
import PixelBackdrop from '@/components/PixelBackdrop.vue'
import ThemeConfigTransfer from '@/components/ThemeConfigTransfer.vue'
import { loadFonts } from '@/lib/fonts'
import { dark, toggleTheme } from '@/lib/theme'

const route = useRoute()
const error = ref('')
const showConfigTransfer = ref(false)
const siteIconUrl = ref('/favicon.svg')
const failedLogos = ref<string[]>([])
const logoUrl = computed(() => [config.value.logoUrl.trim(), siteIconUrl.value, '/weathercock.png']
  .find(url => url && !failedLogos.value.includes(url)))
watch(() => config.value.logoUrl, () => { failedLogos.value = [] })

function logoError(event: Event) {
  const source = (event.target as HTMLImageElement).getAttribute('src')
  if (source) failedLogos.value = [...failedLogos.value, source]
}

async function boot() {
  error.value = ''
  try {
    const [, cfg] = await Promise.all([loadMe(), loadConfig()])
    loadFonts(cfg.pixelFont)
  }
  catch (e) {
    error.value = (e as Error).message
  }
}

onMounted(() => {
  // Hub serves its configured icon here and stamps the link with a content version.
  siteIconUrl.value = document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.getAttribute('href') || '/favicon.svg'
  startNodes()
  void boot()
})

watchEffect(() => document.documentElement.classList.toggle('dark', dark.value))

// The page was closed to anonymous visitors while open: ask again, which
// redirects to the panel instead of leaving a list that no longer updates.
watch(nodesClosed, (closed) => { if (closed) void loadMe().catch(() => {}) })

const siteName = computed(() => me.value?.site_name || 'Monitor')
const nodeName = computed(() => route.name === 'node' ? nodes.value?.find(n => n.id === Number(route.params.id))?.name : undefined)
watchEffect(() => { document.title = [nodeName.value, siteName.value].filter(Boolean).join(' · ') })
</script>

<template>
  <div v-if="!me" class="boot">
    <template v-if="error">
      <p role="alert">加载失败：{{ error }}</p>
      <button class="btn" @click="boot">重试</button>
    </template>
    <p v-else class="display">LOADING<span class="caret">_</span></p>
  </div>

  <template v-else-if="me.public_page || me.authed">
    <PixelBackdrop />
    <header class="top">
      <div class="wrap bar">
        <RouterLink to="/" class="brand">
          <img
            v-if="logoUrl" :key="logoUrl" :src="logoUrl"
            class="site-logo" width="32" height="32" alt=""
            @error="logoError"
          >
          <PixelGuardian v-else :size="32" aria-hidden="true" />
          <span>{{ siteName }}</span>
        </RouterLink>
        <span class="live" :title="live ? '实时推送中' : '轮询中'">
          <i class="dot" :class="{ on: live }" />
          <span class="display">{{ live ? 'LIVE' : 'POLL' }}</span>
        </span>
        <div class="grow" />
        <button v-if="me.authed" class="btn config-button" type="button" @click="showConfigTransfer = true">主题配置</button>
        <a class="btn" href="/admin/">
          <PixelIcon name="key" :size="14" />
          <span>{{ me.authed ? '后台' : '登录' }}</span>
        </a>
        <button class="btn icon" :title="dark ? '切换到亮色' : '切换到暗色'" @click="toggleTheme">
          <PixelIcon :name="dark ? 'sun' : 'moon'" :size="16" />
        </button>
      </div>
    </header>

    <ThemeConfigTransfer v-if="me.authed && showConfigTransfer" @close="showConfigTransfer = false" />

    <main class="wrap content">
      <RouterView />
    </main>
  </template>
</template>

<style scoped>
.boot {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  min-height: 100svh;
  font-size: 24px;
}

.boot p {
  margin: 0;
  font-size: var(--fs);
}

.boot .display {
  font-size: 24px;
}

.caret {
  animation: caret 1s steps(1) infinite;
}

@keyframes caret {
  50% {
    opacity: 0;
  }
}

.top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  border-bottom: var(--b) solid var(--ink);
}

.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 24px;
  line-height: 1;
  text-decoration: none;
}

.site-logo {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: contain;
  image-rendering: auto;
}

.brand > img,
.brand > svg {
  flex-shrink: 0;
}

.brand span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live {
  display: none;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

@media (min-width: 560px) {
  .live {
    display: flex;
  }
}

.grow {
  flex: 1;
}

.content {
  position: relative;
  z-index: 1;
}

</style>

<style>
.wrap {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 640px) {
  .wrap {
    padding: 0 24px;
  }
}
</style>
