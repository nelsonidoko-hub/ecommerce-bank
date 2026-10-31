import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/admin`

export const resetStoreData = async (confirm, token) => {
  const response = await axios.post(
    `${API_URL}/reset-store`,
    { confirm },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}