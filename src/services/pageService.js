import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/pages`

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

// Public: published pages, without their text. Used by the footer.
export const getFooterPages = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

// Public: one published page with its text
export const getPage = async (slug) => {
  const response = await axios.get(`${API_URL}/${encodeURIComponent(slug)}`)
  return response.data
}

// Admin
export const getAllPages = async (token) => {
  const response = await axios.get(`${API_URL}/all`, authHeader(token))
  return response.data
}

export const createPage = async (data, token) => {
  const response = await axios.post(API_URL, data, authHeader(token))
  return response.data
}

export const updatePage = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/${id}`, data, authHeader(token))
  return response.data
}

export const deletePage = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader(token))
  return response.data
}