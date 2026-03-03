import type { ApiError } from 'shared'

export class ApiClientError extends Error {
  status: number
  details?: ApiError['details']

  constructor(status: number, message: string, details?: ApiError['details']) {
    super(message)
    this.status = status
    this.details = details
  }
}

let currentUserId: number | null = null

export function setCurrentUserId(id: number | null) {
  currentUserId = id
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (currentUserId !== null) {
    headers['X-User-Id'] = String(currentUserId)
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json()

  if (!res.ok) {
    throw new ApiClientError(res.status, data.error ?? 'Onbekende fout', data.details)
  }

  return data as T
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body: unknown) => request<T>('PUT', url, body),
  delete: <T = void>(url: string) => request<T>('DELETE', url),
}
