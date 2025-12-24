import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { isAuthed } from './lib/auth'

export function RequireAuth() {
  const location = useLocation()
  const navigate = useNavigate()

  if (!isAuthed()) {
    // Small delay to ensure logout is complete
    setTimeout(() => {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }, 100)
    return null
  }
  return <Outlet />
}
