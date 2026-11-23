import axios from 'axios'
import { API_BASE } from '../config'

// The Market Square: products from every shop that opted in
const API = `${API_BASE}/api/market`

export const getMarketMeta = async () => (await axios.get(`${API}/meta`)).data
export const getMarketProducts = async (params) => (await axios.get(`${API}/products`, { params })).data
export const reportListing = async (productId, reason, details) => (await axios.post(`${API}/report`, { productId, reason, details })).data

// Count a visit for the merchant. "keepalive" lets it finish while the
// browser moves on to the shop; a failure never stops the shopper.
export function countClick(productId) {
  try {
    fetch(`${API}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}

// The shop's own settings (shop admin)
export const getMarketSettings = async () => (await axios.get(`${API_BASE}/api/market-settings`)).data
export const saveMarketSettings = async (values) => (await axios.put(`${API_BASE}/api/market-settings`, values)).data
