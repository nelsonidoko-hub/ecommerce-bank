import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/settings`

export const getSettings = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

export const updateSettings = async (data, token) => {
  const response = await axios.put(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}