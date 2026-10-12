import axios from 'axios'

const API_URL = 'https://abuja-store-backend.onrender.com/api/admin'

export const resetStoreData = async (confirm, token) => {
  const response = await axios.post(
    `${API_URL}/reset-store`,
    { confirm },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return response.data
}