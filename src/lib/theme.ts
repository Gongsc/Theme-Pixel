import { computed, ref } from 'vue'
import { config } from '@/api/config'

const DARK = matchMedia('(prefers-color-scheme: dark)')

function readSaved(): string | null {
  try { return localStorage.getItem('theme') }
  catch { return null }
}

const saved = ref(readSaved())
const system = ref(DARK.matches)
DARK.addEventListener('change', () => { system.value = DARK.matches })

/**
 * The visitor's own choice, else the site's default, else the system. Only the
 * toggle writes the choice down; the admin panel shares this key on the origin.
 */
export const dark = computed(() => {
  const choice = saved.value ?? (config.value.defaultTheme === 'system' ? null : config.value.defaultTheme)
  return choice ? choice === 'dark' : system.value
})

export function toggleTheme() {
  const next = dark.value ? 'light' : 'dark'
  try { localStorage.setItem('theme', next) }
  catch { /* private mode */ }
  saved.value = next
}
