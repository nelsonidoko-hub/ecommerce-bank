import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

function AdminRegister() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [setupKey, setSetupKey] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('https://abuja-store-backend.onrender.com/api/users/register-admin', {
        name,
        email,
        password,
        setupKey,
      })

      setUser(response.data)
      localStorage.setItem('user', JSON.stringify(response.data))
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin Setup</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="border rounded-md p-2" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border rounded-md p-2" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="border rounded-md p-2" />
        <input type="password" placeholder="Setup Key" value={setupKey} onChange={(e) => setSetupKey(e.target.value)} required className="border rounded-md p-2" />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Create Admin Account
        </button>
      </form>
    </div>
  )
}

export default AdminRegister