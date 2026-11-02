import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/discounts`

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

// Customer: check a code at checkout. Returns { code, amount, description }.
export const validateDiscount = async (code, subtotal, token) => {
  const response = await axios.post(`${API_URL}/validate`, { code, subtotal }, authHeader(token))
  return response.data
}

// Admin
export const getDiscounts = async (token) => {
  const response = await axios.get(API_URL, authHeader(token))
  return response.data
}

export const createDiscount = async (data, token) => {
  const response = await axios.post(API_URL, data, authHeader(token))
  return response.data
}

export const updateDiscount = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/${id}`, data, authHeader(token))
  return response.data
}

export const deleteDiscount = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader(token))
  return response.data
}