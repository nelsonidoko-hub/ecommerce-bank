import axios from 'axios'

const API_URL = 'https://abuja-store-backend.onrender.com/api/users'

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/register`, { name, email, password })
  return response.data
}

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password })
  return response.data
}

export const getAllCustomers = async (token) => {
  const response = await axios.get(`${API_URL}/customers`, authHeader(token))
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email })
  return response.data
}

export const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, password })
  return response.data
}