import axios from 'axios'
import { API_BASE } from '../config'

// The shop paying the platform for its plan
const API = `${API_BASE}/api/billing`

export const getBilling = async () => (await axios.get(API)).data
export const startCheckout = async (plan) => (await axios.post(`${API}/checkout`, { plan })).data
export const confirmPayment = async (reference) => (await axios.post(`${API}/confirm`, { reference })).data
export const changePlan = async (plan) => (await axios.post(`${API}/plan`, { plan })).data
export const setAutoRenew = async (on) => (await axios.post(`${API}/auto-renew`, { on })).data
