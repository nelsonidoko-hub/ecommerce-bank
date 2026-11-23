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
