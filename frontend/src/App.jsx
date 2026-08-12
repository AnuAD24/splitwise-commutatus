import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ExpenseDetail from './pages/ExpenseDetail'
import Login from './pages/Login'
import NewExpense from './pages/NewExpense'
import Person from './pages/Person'
import Register from './pages/Register'
import Settle from './pages/Settle'

function Protected({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="page-center">Loading…</div>
  if (!token) return <Navigate to="/login" replace />
  return children
}

function GuestOnly({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="page-center">Loading…</div>
  if (token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="expenses/new" element={<NewExpense />} />
        <Route path="expenses/:id" element={<ExpenseDetail />} />
        <Route path="people/:id" element={<Person />} />
        <Route path="settle" element={<Settle />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
