import axios from 'axios'

// Which shop this storefront is.
//
// In production every shop has its own address (amaka.yourplatform.com or
// amaka.com), so the hostname says it all and the API works it out.
// While developing (localhost, Vercel previews) the address says nothing, so
// the shop is named with ?store=amaka once; it is remembered after that.
// VITE_DEFAULT_STORE is a fallback for local development only.

const REMEMBER_KEY = 'dev_store_slug'
const SLUG = /^[a-z0-9-]{3,40}$/

function readSlug() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('store')
    if (fromUrl && SLUG.test(fromUrl.toLowerCase())) {
      localStorage.setItem(REMEMBER_KEY, fromUrl.toLowerCase())
      return fromUrl.toLowerCase()
    }
    const remembered = localStorage.getItem(REMEMBER_KEY)
    if (remembered && SLUG.test(remembered)) return remembered
  } catch {
    // storage blocked: fall through
  }
  const fallback = (import.meta.env?.VITE_DEFAULT_STORE || '').toLowerCase()
  return SLUG.test(fallback) ? fallback : ''
}

export const storeHost = typeof window !== 'undefined' ? window.location.hostname : ''
export const storeSlug = typeof window !== 'undefined' ? readSlug() : ''

// Sent with every API call, so the server knows which shop's data to use
export function storeHeaders() {
  const headers = { 'X-Store-Host': storeHost }
  if (storeSlug) headers['X-Store-Slug'] = storeSlug
  return headers
}

// Browser storage is per address. On localhost several shops share one
// address, so their logins, carts and themes are kept apart by name.
export function storeKey(name) {
  return storeSlug ? `${storeSlug}:${name}` : name
}

// Reads the signed-in person saved for this shop
export function storedUser() {
  try {
    const raw = localStorage.getItem(storeKey('user'))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Every axios request: say which shop, and send the login if there is one
// (a shop's owner can then preview it before it is published).
let installed = false
export function installStoreHeaders() {
  if (installed) return
  installed = true
  axios.interceptors.request.use((config) => {
    const headers = config.headers || {}
    const set = (k, v) => (typeof headers.set === 'function' ? headers.set(k, v) : (headers[k] = v))
    const has = (k) => (typeof headers.has === 'function' ? headers.has(k) : headers[k] !== undefined)

    for (const [k, v] of Object.entries(storeHeaders())) set(k, v)
    if (!has('Authorization')) {
      const token = storedUser()?.token
      if (token) set('Authorization', `Bearer ${token}`)
    }
    config.headers = headers
    return config
  })
}
