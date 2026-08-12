const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(token, extra = {}) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function parseResponse(res) {
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { detail: text }
  }
  if (!res.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
      : detail || res.statusText
    throw new Error(message)
  }
  return data
}

export const api = {
  async register({ name, email, password, mobile_number }) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, mobile_number }),
    })
    return parseResponse(res)
  },

  async login(email, password) {
    const body = new URLSearchParams()
    body.set('username', email)
    body.set('password', password)
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    return parseResponse(res)
  },

  async me(token) {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: authHeaders(token),
    })
    return parseResponse(res)
  },

  async dashboard(token) {
    const res = await fetch(`${API_URL}/api/dashboard`, {
      headers: authHeaders(token),
    })
    return parseResponse(res)
  },

  async users(token) {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: authHeaders(token),
    })
    return parseResponse(res)
  },

  async createExpense(token, payload) {
    const res = await fetch(`${API_URL}/api/expenses`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },

  async getExpense(token, id) {
    const res = await fetch(`${API_URL}/api/expenses/${id}`, {
      headers: authHeaders(token),
    })
    return parseResponse(res)
  },

  async deleteExpense(token, id) {
    const res = await fetch(`${API_URL}/api/expenses/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    if (!res.ok) return parseResponse(res)
    return null
  },

  async person(token, friendId) {
    const res = await fetch(`${API_URL}/api/people/${friendId}`, {
      headers: authHeaders(token),
    })
    return parseResponse(res)
  },

  async createPayment(token, payload) {
    const res = await fetch(`${API_URL}/api/payments`, {
      method: 'POST',
      headers: authHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    })
    return parseResponse(res)
  },
}
