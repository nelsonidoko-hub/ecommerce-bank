import axios from 'axios'
import { API_BASE } from '../config'
import { getAccount } from './platformService'

// The founder dashboard (platform owner only)
const API = `${API_BASE}/api/founder`
const auth = (extra = {}) => ({ ...extra, headers: { Authorization: `Bearer ${getAccount()?.token || ''}` } })

export const getOverview = async () => (await axios.get(`${API}/overview`, auth())).data
export const listShops = async ({ q = '', state = '', page = 1 } = {}) =>
  (await axios.get(`${API}/shops`, auth({ params: { q, state, page } }))).data
export const getShop = async (id) => (await axios.get(`${API}/shops/${id}`, auth())).data
// action: suspend {reason} | unsuspend | extend-trial {days} | free-months {months} | plan {plan}
export const shopAction = async (id, action, extra = {}) =>
  (await axios.post(`${API}/shops/${id}/action`, { action, ...extra }, auth())).data

// The team (Template Studio designers)
export const listTeam = async () => (await axios.get(`${API}/team`, auth())).data
export const addDesigner = async (email) => (await axios.post(`${API}/team`, { email }, auth())).data
export const removeDesigner = async (id) => (await axios.delete(`${API}/team/${id}`, auth())).data

// A shop made for a client (done-for-you): { name, email, shopName, slug?, template }
export const createClientShop = async (values) => (await axios.post(`${API}/clients`, values, auth())).data
