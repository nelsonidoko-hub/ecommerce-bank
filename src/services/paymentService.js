import axios from 'axios'

const API_URL = 'https://abuja-store-backend.onrender.com/api/payments'

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

export const initializePayment = async (orderId, token) => {
  const response = await axios.post(`${API_URL}/initialize`, { orderId }, authHeader(token))
  return response.data
}

export const verifyPayment = async (reference, token) => {
  const response = await axios.get(`${API_URL}/verify/${reference}`, authHeader(token))
  return response.data
}