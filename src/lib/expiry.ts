import type { Node } from '@/api/types'
import { expiresIn } from './format'

type ExpiringNode = { node: Node, days: number }

/** Use the hub's calendar when available, matching the existing node badges. */
export function expiryReminders(nodes: Node[], reminderDays: number) {
  const days = Number.isFinite(reminderDays) ? Math.min(365, Math.floor(reminderDays)) : 0
  const upcoming: ExpiringNode[] = []
  const expired: ExpiringNode[] = []
  if (days <= 0) return { days: 0, upcoming, expired }

  for (const node of nodes) {
    if (!node.expires_at) continue
    const remaining = expiresIn(node)
    if (remaining === null || !Number.isFinite(remaining)) continue
    if (remaining < 0) expired.push({ node, days: remaining })
    else if (remaining <= days) upcoming.push({ node, days: remaining })
  }
  // Stable ties preserve the operator's order. Recently expired nodes come first.
  upcoming.sort((a, b) => a.days - b.days)
  expired.sort((a, b) => b.days - a.days)
  return { days, upcoming, expired }
}
