
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  console.log('AdminRoute loading:', loading)
  console.log('AdminRoute user:', user)
  console.log('AdminRoute role:', user?.role)

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user || user.role !== 'admin') {
    console.log('Redirecting: user missing or role is not admin')
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute