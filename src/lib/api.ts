import { getToken } from './auth'

export const API_BASE_URL = 'http://localhost:3000'

export type ApiError = {
  status: number
  message: string
}

async function parseError(res: Response): Promise<ApiError> {
  const status = res.status
  let message = res.statusText

  try {
    const text = await res.text()
    if (text) {
      try {
        const json = JSON.parse(text) as { message?: string }
        message = json.message ?? text
      } catch {
        message = text
      }
    }
  } catch {
    // ignore
  }

  return { status, message }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()

  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return (await res.json()) as T
  }

  return (await res.text()) as unknown as T
}
