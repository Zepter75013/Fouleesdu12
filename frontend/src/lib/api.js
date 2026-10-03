const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || `Erreur ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export const api = {
  getEdition: () => request('/edition'),
  getEditions: () => request('/editions'),
}
