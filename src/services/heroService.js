import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/hero`

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

// Public: active slides only, in display order
export const getHeroSlides = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

// Admin: every slide, including inactive ones
export const getAllHeroSlides = async (token) => {
  const response = await axios.get(`${API_URL}/all`, authHeader(token))
  return response.data
}

export const createHeroSlide = async (data, token) => {
  const response = await axios.post(API_URL, data, authHeader(token))
  return response.data
}

export const updateHeroSlide = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/${id}`, data, authHeader(token))
  return response.data
}

export const deleteHeroSlide = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader(token))
  return response.data
}

// Upload a photo or video for a hero slide.
// Returns { url, mediaType } where mediaType is 'image' or 'video'.
// (Content-Type is left for axios to set so the multipart boundary is correct.)
export const uploadHeroMedia = async (file, token) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post(`${API_BASE}/api/upload/media`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}