const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  post: (path, body)   => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) }),
  get:  (path)         => apiFetch(path),
  patch:(path, body)   => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
