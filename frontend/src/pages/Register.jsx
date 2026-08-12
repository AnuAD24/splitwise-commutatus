import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile_number: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register({
        ...form,
        mobile_number: form.mobile_number || null,
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">Splitwise</p>
        <h1>Create account</h1>
        <p className="muted">Join and start splitting bills.</p>
        {error && <div className="alert">{error}</div>}
        <label>
          Name
          <input value={form.name} onChange={update('name')} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={update('email')} required />
        </label>
        <label>
          Mobile (optional)
          <input value={form.mobile_number} onChange={update('mobile_number')} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            minLength={6}
            required
          />
        </label>
        <button className="primary-btn" disabled={busy}>
          {busy ? 'Creating…' : 'Sign up'}
        </button>
        <p className="muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
