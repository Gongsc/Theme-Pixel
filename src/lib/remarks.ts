import type { Node } from '../api/types'

export type RemarkTag = { text: string, private: boolean }

function split(text: string | undefined): string[] {
  return [...new Set((text ?? '').split(/[;；\r\n]/).map(value => value.trim()).filter(Boolean))]
}

/** Private notes never fall back into public tags, including on older hubs. */
export function remarkTags(node: Pick<Node, 'public_remark' | 'remark'>, authed: boolean): RemarkTag[] {
  return [
    ...split(node.public_remark).map(text => ({ text, private: false })),
    ...(authed ? split(node.remark).map(text => ({ text, private: true })) : []),
  ]
}
