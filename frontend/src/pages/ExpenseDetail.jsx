import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export default function ExpenseDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [expense, setExpense] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getExpense(token, id)
      .then(setExpense)
      .catch((err) => setError(err.message))
  }, [token, id])

  async function onDelete() {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.deleteExpense(token, id)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <div className="alert">{error}</div>
  if (!expense) return <div className="page-center">Loading expense…</div>

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{expense.date}</p>
            <h1>{expense.description || 'Untitled expense'}</h1>
            <p className="muted">Paid by {expense.paid_by?.name}</p>
          </div>
          <strong>{money(expense.total_amount)}</strong>
        </div>
        <p className="muted">
          Tax {money(expense.tax)} · Tip {money(expense.tip)}
        </p>
        {expense.paid_by_id === user.id && (
          <button type="button" className="ghost-btn" onClick={onDelete}>
            Delete expense
          </button>
        )}
      </section>

      <section className="panel">
        <h2>Items</h2>
        <ul className="list">
          {expense.items.map((item) => (
            <li key={item.id} className="block-item">
              <div className="panel-head">
                <strong>{item.description}</strong>
                <span>{money(item.amount)}</span>
              </div>
              <ul className="sublist">
                {item.shares.map((share) => (
                  <li key={share.id}>
                    <span>{share.user?.name || `User ${share.user_id}`}</span>
                    <span>{money(share.amount)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Final shares</h2>
        <ul className="list">
          {expense.shares.map((share) => (
            <li key={share.id}>
              <span>{share.user?.name || `User ${share.user_id}`}</span>
              <span>{money(share.amount)}</span>
            </li>
          ))}
        </ul>
        <Link to="/">Back to dashboard</Link>
      </section>
    </div>
  )
}
