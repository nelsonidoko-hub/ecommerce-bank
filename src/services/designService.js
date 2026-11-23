import axios from 'axios'
import { API_BASE } from '../config'

// "My templates": designs the merchant saved to reuse (Pro)
const API = `${API_BASE}/api/designs`

export const listDesigns = async () => (await axios.get(API)).data
export const saveDesign = async (name) => (await axios.post(API, { name })).data
export const applyDesign = async (id) => (await axios.post(`${API}/${id}/apply`)).data
export const deleteDesign = async (id) => (await axios.delete(`${API}/${id}`)).data
