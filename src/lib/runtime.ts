const DAY = 86_400

/** Runtime is since this system boot, not measured availability or a saved score. */
export function runtimeProgress(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > Number.MAX_SAFE_INTEGER) return null
  const level = Math.floor(seconds / DAY)
  return {
    level,
    label: String(level).padStart(2, '0'),
    progress: (seconds % DAY) / DAY * 100,
    nextDays: level + 1,
  }
}
