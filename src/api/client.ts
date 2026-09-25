export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * The hub answers errors as one line of plain text. Anything else came from a
 * proxy or CDN in front of it and is described by its status instead.
 */
async function failure(res: Response): Promise<ApiError> {
  const text = res.headers.get('content-type')?.startsWith('text/plain') ? (await res.text()).trim() : ''
  return new ApiError(res.status, text || (res.status >= 500
    ? `服务暂时无法访问（HTTP ${res.status}）`
    : `请求被拦截（HTTP ${res.status}）`))
}

export async function api<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, { credentials: 'same-origin', signal })
  }
  catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new ApiError(0, '网络连接失败')
  }
  if (!res.ok) throw await failure(res)
  return res.json().catch(() => {
    throw new ApiError(res.status, '收到的不是状态数据')
  })
}
