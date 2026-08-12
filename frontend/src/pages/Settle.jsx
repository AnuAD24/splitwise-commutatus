import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function Settle() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [friends, setFriends] = useState([])
  const [payeeId, setPayeeId] = useState(params.get('payee') || '')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.dashboard(token).then((data) => {
      const owed = data.friends_i_owe
      setFriends(owed)
      if (!payeeId && owed.length) setPayeeId(String(owed[0].user.id))
      if (payeeId) {
        const match = owed.find((row) => String(row.user.id) === String(payeeId))
        if (match) setAmount(String(match.amount))
      }
    })
  }, [token])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.createPayment(token, {
        payee_id: Number(payeeId),
        amount: Number(amount),
        notes: notes || null,
        date,
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="stack form-stack" onSubmit={onSubmit}>
      <section className="panel">
        <h1>Settle up</h1>
        <p className="muted">Record a payment to reduce what you owe.</p>
        {error && <div className="alert">{error}</div>}
        {friends.length === 0 ? (
          <p className="muted">You don’t currently owe anyone.</p>
        ) : (
          <div className="form-grid">
            <label>
              Pay to
              <select value={payeeId} onChange={(e) => setPayeeId(e.target.value)} required>
                {friends.map((row) => (
                  <option key={row.user.id} value={row.user.id}>
                    {row.user.name} (owes {row.amount})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              Notes
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
            </label>
          </div>
        )}
      </section>
      {friends.length > 0 && (
        <button className="primary-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Record payment'}
        </button>
      )}
    </form>
  )
}
