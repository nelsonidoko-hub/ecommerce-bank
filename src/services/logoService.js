
import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/logos`

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

// Get the current store logo
export const getLogo = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

// Create or update the store logo
export const saveLogo = async ({ imageUrl, altText }, token) => {
  const response = await axios.put(
    `${API_URL}/save`,
    { imageUrl, altText },
    authHeader(token)
  )

  return response.data
}
