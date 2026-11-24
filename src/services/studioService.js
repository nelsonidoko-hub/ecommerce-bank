import axios from 'axios'
import { API_BASE } from '../config'
import { getAccount } from './platformService'

// The Template Studio (founder and designers)
const API = `${API_BASE}/api/studio`
const auth = () => ({ headers: { Authorization: `Bearer ${getAccount()?.token || ''}` } })

export const getStudioOptions = async () => (await axios.get(`${API}/options`, auth())).data
export const listStudio = async () => (await axios.get(API, auth())).data
export const getStudioTemplate = async (id) => (await axios.get(`${API}/${id}`, auth())).data
export const createStudioTemplate = async (values) => (await axios.post(API, values, auth())).data
export const updateStudioTemplate = async (id, values) => (await axios.put(`${API}/${id}`, values, auth())).data
// status: review | draft | published | hidden
export const setStudioStatus = async (id, status) => (await axios.post(`${API}/${id}/status`, { status }, auth())).data
export const deleteStudioTemplate = async (id) => (await axios.delete(`${API}/${id}`, auth())).data
