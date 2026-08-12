import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function emptyItem(users, currentUserId) {
  const participantIds = users.map((u) => u.id)
  if (!participantIds.includes(currentUserId)) participantIds.unshift(currentUserId)
  return {
    description: '',
    amount: '',
    mode: 'equal',
    selected: participantIds,
    custom: Object.fromEntries(participantIds.map((id) => [id, ''])),
  }
}

export default function NewExpense() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [tax, setTax] = useState('0')
  const [tip, setTip] = useState('0')
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.users(token).then((users) => {
      setFriends(users)
      setItems([emptyItem(users, user.id)])
    })
  }, [token, user.id])

  const people = useMemo(() => [{ id: user.id, name: `${user.name} (you)` }, ...friends], [friends, user])

  function updateItem(index, patch) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function togglePerson(index, personId) {
    const item = items[index]
    const selected = item.selected.includes(personId)
      ? item.selected.filter((id) => id !== personId)
      : [...item.selected, personId]
    updateItem(index, {
      selected,
      custom: {
        ...item.custom,
        [personId]: item.custom[personId] || '',
      },
    })
  }

  function buildShares(item) {
    const amount = Number(item.amount)
    if (!item.selected.length) throw new Error('Each item needs at least one person')
    if (!(amount > 0)) throw new Error('Each item needs an amount greater than 0')

    if (item.mode === 'equal') {
      const each = Number((amount / item.selected.length).toFixed(2))
      let remaining = Number((amount - each * item.selected.length).toFixed(2))
      return item.selected.map((user_id, idx) => {
        const share = idx === 0 ? Number((each + remaining).toFixed(2)) : each
        return { user_id, amount: share }
      })
    }

    const shares = item.selected.map((user_id) => ({
      user_id,
      amount: Number(item.custom[user_id] || 0),
    }))
    const total = shares.reduce((sum, s) => sum + s.amount, 0)
    if (Math.abs(total - amount) > 0.02) {
      throw new Error(`Unequal shares for "${item.description || 'item'}" must equal ${amount}`)
    }
    return shares
  }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        description: description || null,
        date,
        tax: Number(tax || 0),
        tip: Number(tip || 0),
        items: items.map((item) => ({
          description: item.description,
          amount: Number(item.amount),
          shares: buildShares(item),
        })),
      }
      const expense = await api.createExpense(token, payload)
      navigate(`/expenses/${expense.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!items.length) return <div className="page-center">Loading form…</div>

  return (
    <form className="stack form-stack" onSubmit={onSubmit}>
      <section className="panel">
        <h1>Add expense</h1>
        <p className="muted">Split items equally or unequally. Tax and tip split evenly.</p>
        {error && <div className="alert">{error}</div>}
        <div className="form-grid">
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Dinner" />
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Tax
            <input type="number" min="0" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} />
          </label>
          <label>
            Tip
            <input type="number" min="0" step="0.01" value={tip} onChange={(e) => setTip(e.target.value)} />
          </label>
        </div>
      </section>

      {items.map((item, index) => (
        <section className="panel" key={index}>
          <div className="panel-head">
            <h2>Item {index + 1}</h2>
            {items.length > 1 && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            )}
          </div>
          <div className="form-grid">
            <label>
              Item description
              <input
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                required
              />
            </label>
            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={item.amount}
                onChange={(e) => updateItem(index, { amount: e.target.value })}
                required
              />
            </label>
          </div>

          <div className="split-toggle">
            <button
              type="button"
              className={item.mode === 'equal' ? 'active' : ''}
              onClick={() => updateItem(index, { mode: 'equal' })}
            >
              Split equally
            </button>
            <button
              type="button"
              className={item.mode === 'unequal' ? 'active' : ''}
              onClick={() => updateItem(index, { mode: 'unequal' })}
            >
              Split unequally
            </button>
          </div>

          <ul className="people-picker">
            {people.map((person) => (
              <li key={person.id}>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={item.selected.includes(person.id)}
                    onChange={() => togglePerson(index, person.id)}
                  />
                  <span>{person.name}</span>
                </label>
                {item.mode === 'unequal' && item.selected.includes(person.id) && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Share"
                    value={item.custom[person.id] || ''}
                    onChange={(e) =>
                      updateItem(index, {
                        custom: { ...item.custom, [person.id]: e.target.value },
                      })
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="hero-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setItems((prev) => [...prev, emptyItem(friends, user.id)])}
        >
          Add item
        </button>
        <button className="primary-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save expense'}
        </button>
      </div>
    </form>
  )
}
