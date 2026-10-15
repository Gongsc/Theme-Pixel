import { api } from '../api/client'
import { configDefaults, configFields, fits, type SiteConfig } from '../api/config'
import { me } from '../api/me'
import manifest from '../../theme.json'

export const CONFIG_FILE_LIMIT = 256 * 1024
const FORMAT = 'monitor-theme-config'
const path = `/themes/${manifest.short}/config`
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function resolvedConfig(saved: Record<string, unknown>): SiteConfig {
  return { ...configDefaults, ...Object.fromEntries(configFields
    .filter(f => Object.hasOwn(saved, f.key) && fits(f, saved[f.key]))
    .map(f => [f.key, saved[f.key]])) }
}

/** Unlike startup loading, a backup must fail if the saved settings cannot be read. */
export async function readThemeSettings(): Promise<Record<string, unknown>> {
  if (me.value?.authed !== true) throw new Error('请先登录管理员账号')
  const saved: unknown = await api(path, undefined, { cache: 'no-store' })
  if (!isObject(saved)) throw new Error('主题配置响应无效，请重试')
  return saved
}

export function exportThemeSettings(saved: Record<string, unknown>): string {
  return JSON.stringify({
    format: FORMAT,
    version: 1,
    theme: { short: manifest.short, version: manifest.version },
    config: resolvedConfig(saved),
  }, null, 2) + '\n'
}

/** Validate every provided field before exposing a draft to the UI. */
export function importThemeSettings(text: string): { values: SiteConfig, ignored: number } {
  if (new TextEncoder().encode(text).length > CONFIG_FILE_LIMIT) throw new Error('配置文件不能超过 256 KiB')
  let data: unknown
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')) }
  catch { throw new Error('配置文件不是有效的 JSON') }
  if (!isObject(data) || data.format !== FORMAT || data.version !== 1 || !isObject(data.theme)
    || typeof data.theme.short !== 'string' || !isObject(data.config)) {
    throw new Error('请选择由「导出配置」生成的 JSON 文件')
  }
  if (data.theme.short !== manifest.short) throw new Error('配置属于其他主题，无法导入 Pixel')
  const settings = data.config
  const invalid = configFields.find(f => Object.hasOwn(settings, f.key) && !fits(f, settings[f.key]))
  if (invalid) {
    const label = manifest.config.find(f => 'key' in f && f.key === invalid.key)?.label ?? invalid.key
    throw new Error(`「${label}」的类型、选项或范围无效，未导入任何配置`)
  }
  const keys = new Set(configFields.map(f => f.key))
  return { values: resolvedConfig(settings), ignored: Object.keys(settings).filter(key => !keys.has(key)).length }
}

export async function saveThemeSettings(values: SiteConfig): Promise<void> {
  if (me.value?.authed !== true) throw new Error('请先登录管理员账号')
  if (configFields.some(f => !fits(f, values[f.key as keyof SiteConfig]))) throw new Error('配置值无效，请重新导入')
  // Read again: preserve settings from newer theme versions and never write after a failed read.
  const latest = await readThemeSettings()
  const next = { ...latest }
  for (const field of configFields) {
    const value = values[field.key as keyof SiteConfig]
    if (value === field.default) delete next[field.key]
    else next[field.key] = value
  }
  const body = JSON.stringify(next)
  if (new TextEncoder().encode(body).length > 64 * 1024) throw new Error('配置超过 64 KiB，请缩短公告或 Logo 地址后重试')
  await api<void>(path, undefined, { method: 'PUT', body, headers: { 'content-type': 'application/json' } })
}

export const settingLabels = Object.fromEntries(manifest.config
  .filter(f => 'key' in f).map(f => [f.key, f.label])) as Record<keyof SiteConfig, string>
