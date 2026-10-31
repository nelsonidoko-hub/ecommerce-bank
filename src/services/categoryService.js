import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/categories`

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

// Tree shape: [{ _id, name, label, children: [{ _id, name, label }] }]
export const getCategories = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

// Flat list — every category, no nesting
export const getFlatCategories = async () => {
  const response = await axios.get(`${API_URL}/flat`)
  return response.data
}

export const createCategory = async (data, token) => {
  const response = await axios.post(API_URL, data, authHeader(token))
  return response.data
}

export const updateCategory = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/${id}`, data, authHeader(token))
  return response.data
}

export const deleteCategory = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader(token))
  return response.data
}