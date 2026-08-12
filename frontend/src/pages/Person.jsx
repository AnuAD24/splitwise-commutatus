import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export default function Person() {
  const { id } = useParams()
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .person(token, id)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token, id])

  if (error) return <div className="alert">{error}</div>
  if (!data) return <div className="page-center">Loading…</div>

  const balance = Number(data.balance)
  const balanceText =
    balance > 0
      ? `${data.friend.name} owes you ${money(balance)}`
      : balance < 0
        ? `You owe ${data.friend.name} ${money(Math.abs(balance))}`
        : `You are settled up with ${data.friend.name}`

  return (
    <div className="stack">
      <section className="panel">
        <p className="eyebrow">Friend</p>
        <h1>{data.friend.name}</h1>
        <p className={balance === 0 ? 'muted' : balance > 0 ? 'positive' : 'negative'}>
          {balanceText}
        </p>
        {balance < 0 && (
          <Link className="primary-btn" to={`/settle?payee=${data.friend.id}`}>
            Settle up
          </Link>
        )}
      </section>

      <section className="panel">
        <h2>Expenses you paid</h2>
        <ul className="list">
          {data.expenses_i_paid.map((expense) => (
            <li key={expense.id}>
              <Link to={`/expenses/${expense.id}`}>{expense.description || 'Untitled'}</Link>
              <span>
                {expense.date} · {money(expense.total_amount)}
              </span>
            </li>
          ))}
          {data.expenses_i_paid.length === 0 && <li className="muted">None</li>}
        </ul>
      </section>

      <section className="panel">
        <h2>Expenses they paid</h2>
        <ul className="list">
          {data.expenses_friend_paid.map((expense) => (
            <li key={expense.id}>
              <Link to={`/expenses/${expense.id}`}>{expense.description || 'Untitled'}</Link>
              <span>
                {expense.date} · {money(expense.total_amount)}
              </span>
            </li>
          ))}
          {data.expenses_friend_paid.length === 0 && <li className="muted">None</li>}
        </ul>
      </section>
    </div>
  )
}
