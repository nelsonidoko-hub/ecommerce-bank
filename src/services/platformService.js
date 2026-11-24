import axios from 'axios'
import { API_BASE } from '../config'

// The platform site's API: templates, sign-up, a merchant's shops.
const API = `${API_BASE}/api/platform`
const ACCOUNT_KEY = 'platform_account'

export function getAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null')
  } catch {
    return null
  }
}
export function saveAccount(account) {
  try {
    if (account) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
    else localStorage.removeItem(ACCOUNT_KEY)
  } catch {
    // storage blocked: they'll need to log in again next visit
  }
}

const auth = () => ({ headers: { Authorization: `Bearer ${getAccount()?.token || ''}` } })

// Turns an API failure into a sentence for the page
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || fallback
}

export const getPlans = async () => (await axios.get(`${API}/plans`)).data
export const getDemos = async () => (await axios.get(`${API}/demos`)).data
// Templates made in the Template Studio and published to the gallery
export const getStudioGallery = async () => (await axios.get(`${API}/templates`)).data
export const checkSlug = async ({ slug, name }) =>
  (await axios.get(`${API}/slug-check`, { params: slug ? { slug } : { name } })).data

export const signup = async (data) => (await axios.post(`${API}/signup`, data)).data
export const login = async (email, password) => (await axios.post(`${API}/login`, { email, password })).data

export const getMe = async () => (await axios.get(`${API}/me`, auth())).data
export const createShop = async (data) => (await axios.post(`${API}/shops`, data, auth())).data
// A one-time link that signs the merchant into that shop ('admin' or 'shop')
export const adminLink = async (shopId, next = 'admin') =>
  (await axios.post(`${API}/shops/${shopId}/admin-link`, { next }, auth())).data

// The merchant's own saved templates, to start a new shop from (Pro)
export const getMyDesigns = async () => (await axios.get(`${API}/designs`, auth())).data

// Forgotten password for a merchant account (the platform site, not a shop)
export const forgotPassword = async (email) => (await axios.post(`${API}/forgot-password`, { email })).data
export const resetPassword = async (token, password) => (await axios.post(`${API}/reset-password`, { token, password })).data
