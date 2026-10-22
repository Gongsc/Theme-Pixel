import { computed, shallowRef } from 'vue'
import { me } from './me'
import manifest from '../../theme.json'

type Field = { key?: string, type: string, default?: unknown, options?: { value: string }[], min?: number, max?: number }

export type SiteConfig = {
  defaultTheme: 'system' | 'light' | 'dark'
  cardLayout: 'grid' | 'list'
  animatedBackground: boolean
  logoUrl: string
  pixelFont: boolean
  notice: string
  showSummary: boolean
  expiryReminderDays: number
  showPrice: boolean
  hidePriceForGuests: boolean
  hideOffline: boolean
  showPing: boolean
  pingProbes: number
  pingNames: string
  defaultRange: '1' | '6' | '24' | '168' | '720' | '2160'
}

export const configFields = (manifest.config as Field[]).filter((f): f is Field & { key: string } => f.type !== 'title' && !!f.key)
export const configDefaults = Object.fromEntries(configFields.map(f => [f.key, f.default])) as SiteConfig

export function fits(field: Field, value: unknown): boolean {
  switch (field.type) {
    case 'boolean': return typeof value === 'boolean'
    case 'number': return typeof value === 'number' && Number.isFinite(value)
      && value >= (field.min ?? -Infinity) && value <= (field.max ?? Infinity)
    case 'select': return !!field.options?.some(o => o.value === value)
    case 'string':
    case 'text': return typeof value === 'string'
    default: return false
  }
}

export const config = shallowRef<SiteConfig>({ ...configDefaults })

/** The master switch applies to cards and details, including signed-in users. */
export const showNodePrice = computed(() => config.value.showPrice &&
  (!config.value.hidePriceForGuests || me.value?.authed === true))

/** Anonymous visitors, older hubs and unreachable hubs all render the defaults. */
export async function loadConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`/api/themes/${manifest.short}/config`, { credentials: 'same-origin', cache: 'no-store' })
    if (res.ok) {
      const saved = await res.json() as Record<string, unknown>
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        const valid = configFields.filter(f => Object.hasOwn(saved, f.key) && fits(f, saved[f.key]))
        config.value = { ...configDefaults, ...Object.fromEntries(valid.map(f => [f.key, saved[f.key]])) }
      }
    }
  }
  catch { /* defaults */ }
  return config.value
}
