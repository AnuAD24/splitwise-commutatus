import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

function money(value) {
  const n = Number(value || 0)
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

export default function Dashboard() {
  const { token, user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .dashboard(token)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [token])

  if (error) return <div className="alert">{error}</div>
  if (!data) return <div className="page-center">Loading dashboard…</div>

  return (
    <div className="stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>{user?.name}</h1>
          <p className="muted">Your shared expenses and balances at a glance.</p>
        </div>
        <div className="hero-actions">
          <Link className="primary-btn" to="/expenses/new">
            Add expense
          </Link>
          <Link className="secondary-btn" to="/settle">
            Settle up
          </Link>
        </div>
      </section>

      <section className="balance-grid">
        <article>
          <p>Total balance</p>
          <strong className={Number(data.total_balance) >= 0 ? 'positive' : 'negative'}>
            {money(data.total_balance)}
          </strong>
        </article>
        <article>
          <p>You owe</p>
          <strong className="negative">{money(data.total_i_owe)}</strong>
        </article>
        <article>
          <p>You are owed</p>
          <strong className="positive">{money(data.total_owed_to_me)}</strong>
        </article>
      </section>

      <div className="two-col">
        <section className="panel">
          <h2>You owe</h2>
          {data.friends_i_owe.length === 0 && <p className="muted">All settled here.</p>}
          <ul className="list">
            {data.friends_i_owe.map((row) => (
              <li key={row.user.id}>
                <Link to={`/people/${row.user.id}`}>{row.user.name}</Link>
                <span className="negative">{money(row.amount)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Owes you</h2>
          {data.friends_who_owe_me.length === 0 && <p className="muted">No one owes you right now.</p>}
          <ul className="list">
            {data.friends_who_owe_me.map((row) => (
              <li key={row.user.id}>
                <Link to={`/people/${row.user.id}`}>{row.user.name}</Link>
                <span className="positive">{money(row.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Recent expenses</h2>
          <Link to="/expenses/new">New</Link>
        </div>
        {data.recent_expenses.length === 0 && <p className="muted">No expenses yet.</p>}
        <ul className="list">
          {data.recent_expenses.map((expense) => (
            <li key={expense.id}>
              <Link to={`/expenses/${expense.id}`}>
                {expense.description || 'Untitled expense'}
              </Link>
              <span>
                {expense.date} · {money(expense.total_amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Friends</h2>
        {data.friends.length === 0 && (
          <p className="muted">Register more users to split expenses with friends.</p>
        )}
        <ul className="chip-row">
          {data.friends.map((friend) => (
            <li key={friend.id}>
              <Link to={`/people/${friend.id}`}>{friend.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
