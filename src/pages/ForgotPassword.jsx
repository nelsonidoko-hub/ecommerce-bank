import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authService'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
    } finally {
      setLoading(false)
      setSent(true)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 pt-28 pb-12">
      <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>

      {sent ? (
        <p className="text-gray-600">
          If that email is registered, we've sent a link to reset your password. It expires in 30 minutes.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border rounded-md p-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-gray-600">
        <Link to="/login" className="text-blue-600 underline">Back to login</Link>
      </p>
    </div>
  )
}

export default ForgotPassword