<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { SiteConfig } from '@/api/config'
import { CONFIG_FILE_LIMIT, exportThemeSettings, importThemeSettings, readThemeSettings, resolvedConfig, saveThemeSettings, settingLabels } from '@/lib/config-transfer'

const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
const picker = ref<HTMLInputElement>()
const saved = ref<Record<string, unknown> | null>(null)
const draft = ref<SiteConfig | null>(null)
const loading = ref(false)
const saving = ref(false)
const reading = ref(false)
const error = ref('')
const message = ref('')
const applied = ref(false)
const pasted = ref('')
let active = true
const busy = computed(() => loading.value || saving.value || reading.value)
const changes = computed(() => {
  if (!draft.value || !saved.value) return []
  const current = resolvedConfig(saved.value)
  return (Object.keys(draft.value) as (keyof SiteConfig)[])
    .filter(key => current[key] !== draft.value![key])
    .map(key => ({ key, label: settingLabels[key], before: current[key], after: draft.value![key] }))
})
const refreshPage = () => window.location.reload()
const displayValue = (value: unknown) => typeof value === 'boolean' ? value ? '开启' : '关闭' : value === '' ? '（空）' : String(value)

async function load() {
  loading.value = true
  error.value = ''
  try { saved.value = await readThemeSettings() }
  catch (e) { error.value = (e as Error).message }
  finally { loading.value = false }
}

function close() {
  if (!saving.value) dialog.value?.close()
}

function exportConfig() {
  if (!saved.value) return
  const url = URL.createObjectURL(new Blob([exportThemeSettings(saved.value)], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `pixel-config-${new Date().toISOString().slice(0, 10)}.json`
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function prepare(text: string) {
  error.value = ''
  message.value = ''
  draft.value = null
  try {
    const imported = importThemeSettings(text)
    draft.value = imported.values
    message.value = imported.ignored ? `已忽略 ${imported.ignored} 个当前版本不支持的字段。` : ''
  }
  catch (e) { error.value = (e as Error).message }
}

async function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  reading.value = true
  error.value = ''
  draft.value = null
  try {
    if (file.size > CONFIG_FILE_LIMIT) throw new Error('配置文件不能超过 256 KiB')
    const text = await file.text()
    if (active) prepare(text)
  }
  catch (e) { if (active) error.value = (e as Error).message }
  finally { reading.value = false }
}

async function apply() {
  if (!draft.value || busy.value) return
  saving.value = true
  error.value = ''
  try {
    await saveThemeSettings(draft.value)
    applied.value = true
    draft.value = null
    message.value = '配置已保存，刷新页面后生效。'
  }
  catch (e) { error.value = (e as Error).message }
  finally { saving.value = false }
}

onMounted(() => { dialog.value?.showModal(); void load() })
onBeforeUnmount(() => { active = false })
</script>

<template>
  <dialog ref="dialog" class="transfer box" aria-labelledby="config-title" aria-describedby="config-description" @close="emit('close')" @cancel.prevent="close">
    <header class="heading">
      <h2 id="config-title">主题配置</h2>
      <button class="btn icon" type="button" aria-label="关闭主题配置" :disabled="saving" @click="close">×</button>
    </header>
    <div class="body">
      <p id="config-description" class="muted">备份或迁移 Pixel 主题设置。导入后先预览变更，点击保存才会生效。</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <p v-if="message" class="message" role="status">{{ message }}</p>
      <p v-if="loading" role="status">读取配置中…</p>
      <button v-else-if="!saved" class="btn" type="button" @click="load">重新读取</button>
      <template v-else-if="!applied">
        <div class="actions">
          <button class="btn" type="button" :disabled="busy" @click="exportConfig">导出当前配置</button>
          <button class="btn" type="button" :disabled="busy" @click="picker?.click()">{{ reading ? '读取文件中…' : '导入配置文件' }}</button>
          <input ref="picker" type="file" accept=".json,application/json" hidden aria-label="选择主题配置文件" @change="selectFile">
        </div>
        <details class="paste">
          <summary>粘贴配置 JSON</summary>
          <label for="config-json" class="muted">配置内容</label>
          <textarea id="config-json" v-model="pasted" class="input" rows="5" spellcheck="false" :disabled="busy" />
          <button class="btn" type="button" :disabled="busy || !pasted.trim()" @click="prepare(pasted)">预览导入</button>
        </details>
        <section v-if="draft" class="review" aria-labelledby="review-title">
          <h3 id="review-title">{{ changes.length ? `${changes.length} 项变更` : '配置与当前设置一致' }}</h3>
          <div v-if="changes.length" class="table-wrap">
            <table>
              <thead><tr><th scope="col">设置</th><th scope="col">当前</th><th scope="col">导入后</th></tr></thead>
              <tbody>
                <tr v-for="item in changes" :key="item.key">
                  <th scope="row">{{ item.label }}</th>
                  <td>{{ displayValue(item.before) }}</td><td>{{ displayValue(item.after) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="muted">缺少的设置使用当前版本默认值。取消可放弃导入。</p>
        </section>
      </template>
    </div>
    <footer class="footer">
      <button class="btn" type="button" :disabled="saving" @click="close">{{ applied ? '关闭' : '取消' }}</button>
      <button v-if="applied" class="btn" type="button" @click="refreshPage">刷新页面</button>
      <button v-else class="btn" type="button" :disabled="busy || !draft || !changes.length" @click="apply">{{ saving ? '保存中…' : '保存导入配置' }}</button>
    </footer>
  </dialog>
</template>

<style scoped>
.transfer {
  width: min(720px, calc(100% - 32px));
  max-height: calc(100dvh - 40px);
  padding: 0;
  color: var(--ink);
  font: var(--fs) / 1.6 var(--font);
}
.transfer::backdrop { background: rgb(0 0 0 / 55%); }
.heading, .footer { display: flex; align-items: center; gap: 12px; padding: 16px 20px; }
.heading { justify-content: space-between; border-bottom: 2px solid var(--track); }
h2 { margin: 0; font-size: 22px; font-weight: normal; }
h3 { margin: 0 0 12px; font-size: 16px; font-weight: normal; }
.body { padding: 16px 20px; }
.body > p:first-child { margin-top: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; }
.paste { border-top: 2px dashed var(--track); padding-top: 12px; }
.paste summary { cursor: pointer; width: fit-content; }
.paste label { display: block; margin-top: 12px; }
.paste textarea { display: block; resize: vertical; width: 100%; min-height: 100px; margin: 8px 0 12px; }
.review { margin-top: 20px; padding-top: 16px; border-top: 2px solid var(--track); }
.table-wrap { max-height: 240px; overflow: auto; border: 2px solid var(--track); }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
th, td { padding: 8px; text-align: left; vertical-align: top; overflow-wrap: anywhere; white-space: pre-wrap; border-bottom: 1px solid var(--track); font-weight: normal; }
thead { background: var(--track); }
th:first-child { width: 36%; }
.error { color: var(--red); overflow-wrap: anywhere; }
.message { border-left: 3px solid var(--green); padding-left: 10px; }
.footer { justify-content: flex-end; border-top: 2px solid var(--track); flex-wrap: wrap; }
.btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
@media (max-width: 479px) {
  .heading, .footer, .body { padding: 12px; }
  .actions .btn { flex: 1; justify-content: center; }
}
</style>
