import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/upload`

export const uploadImage = async (file, token) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.url
}