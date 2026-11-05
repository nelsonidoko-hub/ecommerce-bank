import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/payment-settings`

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

// Never contains the secret key itself, only whether one is saved and its last 4 characters
export const getPaymentSettings = async (token) => {
  const response = await axios.get(API_URL, authHeader(token))
  return response.data
}

// data: { password, mode?, testSecretKey?, liveSecretKey?, removeTest?, removeLive? }
export const updatePaymentSettings = async (data, token) => {
  const response = await axios.put(API_URL, data, authHeader(token))
  return response.data
}

// which: 'test' | 'live' to check a saved key, or leave out to check the one in use.
// Returns { ok, mode, message? }
export const testPaystack = async (which, token) => {
  const response = await axios.post(`${API_URL}/test`, which ? { which } : {}, authHeader(token))
  return response.data
}