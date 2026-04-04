import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children, adminOnly }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}