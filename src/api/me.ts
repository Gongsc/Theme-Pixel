import { shallowRef } from 'vue'
import { api } from './client'
import type { Me } from './types'

export const me = shallowRef<Me | null>(null)

export async function loadMe(): Promise<Me> {
  me.value = await api<Me>('/me')
  // The status page is closed and nobody is signed in: the panel handles login.
  if (!me.value.public_page && !me.value.authed) location.assign('/admin/')
  return me.value
}
