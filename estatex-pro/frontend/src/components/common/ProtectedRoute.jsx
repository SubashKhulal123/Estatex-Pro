import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to their correct dashboard
    const dashMap = {
      super_admin: '/dashboard/admin',
      admin: '/dashboard/admin',
      agent: '/dashboard/agent',
      property_manager: '/dashboard/agent',
      customer: '/dashboard/customer',
    }
    return <Navigate to={dashMap[user.role] || '/dashboard/customer'} replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    const dashMap = {
      super_admin: '/dashboard/admin',
      admin: '/dashboard/admin',
      agent: '/dashboard/agent',
      property_manager: '/dashboard/agent',
      customer: '/dashboard/customer',
    }
    return <Navigate to={dashMap[user.role] || '/'} replace />
  }

  return children
}
