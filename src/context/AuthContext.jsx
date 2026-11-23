import { createContext, useContext, useState } from 'react'
import { loginUser, registerUser, resetPassword as resetPasswordRequest } from '../services/authService'
import { storeKey } from '../utils/storeContext'


const AuthContext = createContext()

function getStoredUser() {
  try {
    const stored = localStorage.getItem(storeKey('user'))
    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem(storeKey('user'))
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  async function login(email, password) {
    const data = await loginUser(email, password)

    setUser(data)
    localStorage.setItem(storeKey('user'), JSON.stringify(data))

    return data
  }

  async function register(name, email, password) {
    const data = await registerUser(name, email, password)
    setUser(data)
    localStorage.setItem(storeKey('user'), JSON.stringify(data))
  }

  async function resetPassword(token, password) {
    const data = await resetPasswordRequest(token, password)
    setUser(data)
    localStorage.setItem(storeKey('user'), JSON.stringify(data))
  }

  // Signs in with an account the server already returned (the one-time
  // sign-in link from the platform site)
  function signIn(data) {
    setUser(data)
    localStorage.setItem(storeKey('user'), JSON.stringify(data))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(storeKey('user'))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser, signIn, loading: false, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}