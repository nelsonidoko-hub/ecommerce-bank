import axios from 'axios'
import { API_BASE } from '../config'

// The shop's own setup: checklist, publishing, sample products.
// (The login token is added to every request automatically.)
const API = `${API_BASE}/api/store`

export const getSetup = async () => (await axios.get(`${API}/setup`)).data
export const publishStore = async () => (await axios.post(`${API}/publish`)).data
export const removeSampleProducts = async () => (await axios.delete(`${API}/samples`)).data
