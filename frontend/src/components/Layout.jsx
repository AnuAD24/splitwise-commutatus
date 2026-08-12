import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Splitwise
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/expenses/new">Add expense</NavLink>
          <NavLink to="/settle">Settle up</NavLink>
        </nav>
        <div className="user-chip">
          <span>{user?.name}</span>
          <button type="button" className="ghost-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
