<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { loadConfig } from '@/api/config'
import { loadMe, me } from '@/api/me'
import { live, nodes, nodesClosed, startNodes } from '@/api/nodes'
import PixelIcon from '@/components/PixelIcon.vue'
import { loadFonts } from '@/lib/fonts'
import { dark, toggleTheme } from '@/lib/theme'

const route = useRoute()
const error = ref('')

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
    <header class="top">
      <div class="wrap bar">
        <RouterLink to="/" class="brand">
          <img src="/favicon.svg" width="24" height="24" alt="">
          <span>{{ siteName }}</span>
        </RouterLink>
        <span class="live" :title="live ? '实时推送中' : '轮询中'">
          <i class="dot" :class="{ on: live }" />
          <span class="display">{{ live ? 'LIVE' : 'POLL' }}</span>
        </span>
        <div class="grow" />
        <a class="btn" href="/admin/">
          <PixelIcon name="key" :size="14" />
          <span>{{ me.authed ? '后台' : '登录' }}</span>
        </a>
        <button class="btn icon" :title="dark ? '切换到亮色' : '切换到暗色'" @click="toggleTheme">
          <PixelIcon :name="dark ? 'sun' : 'moon'" :size="16" />
        </button>
      </div>
    </header>

    <main class="wrap">
      <RouterView />
    </main>

    <footer class="wrap foot muted">
      <span>POWERED BY 极简探针</span>
      <span>·</span>
      <a href="https://github.com/Gongsc/Theme-Pixel" target="_blank" rel="noopener">THEME PIXEL</a>
    </footer>
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

.foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 32px 0 40px;
}

.foot a {
  text-decoration: none;
}

.foot a:hover {
  color: var(--ink);
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
