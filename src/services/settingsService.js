import axios from 'axios'
import { API_BASE } from '../config'

const API_URL = `${API_BASE}/api/settings`

// preview: the shop owner's view with the builder's unpublished draft applied
export const getSettings = async ({ preview = false } = {}) => {
  const response = await axios.get(API_URL, preview ? { params: { preview: 1 } } : undefined)
  return response.data
}

export const updateSettings = async (data, token) => {
  const response = await axios.put(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
// ---------- the builder's draft ----------
export const getDraft = async () => (await axios.get(`${API_URL}/draft`)).data
export const saveDraft = async (design) => (await axios.put(`${API_URL}/draft`, design)).data
export const publishDraft = async () => (await axios.post(`${API_URL}/draft/publish`)).data
export const discardDraft = async () => (await axios.delete(`${API_URL}/draft`)).data
