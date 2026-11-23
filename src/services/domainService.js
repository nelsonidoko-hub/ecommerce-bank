import axios from 'axios'
import { API_BASE } from '../config'

// The shop's own web address (Pro)
const API = `${API_BASE}/api/domain`

export const getDomain = async () => (await axios.get(API)).data
export const setDomain = async (domain) => (await axios.put(API, { domain })).data
export const verifyDomain = async () => (await axios.post(`${API}/verify`)).data
export const removeDomain = async () => (await axios.delete(API)).data
