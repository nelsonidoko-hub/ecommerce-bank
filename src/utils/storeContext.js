import axios from 'axios'

// Is this the platform's own site, or one shop? And if a shop, which?
//
// Production:
//   yourplatform.com / www.yourplatform.com  -> the platform site
//   amaka.yourplatform.com                   -> shop "amaka"
//   amaka.com (a shop's own domain)          -> that shop (the API works it out)
// Development (localhost, *.vercel.app, *.onrender.com), where the address
// says nothing:
//   ?store=amaka   -> shop "amaka" (remembered for this browser tab)
//   ?platform=1    -> the platform site (remembered for this browser tab)
//   neither        -> VITE_DEFAULT_STORE if set, otherwise the platform site

const MODE_KEY = 'dev_site'
const SLUG = /^[a-z0-9-]{3,40}$/
const DEV_HOST = /^(localhost|127\.0\.0\.1)$|\.vercel\.app$|\.onrender\.com$/

export const PLATFORM_DOMAIN = String(import.meta.env?.VITE_PLATFORM_DOMAIN || '').trim().toLowerCase()
export const PLATFORM_NAME = import.meta.env?.VITE_PLATFORM_NAME || 'ShopBuilder'

export const storeHost = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : ''
const isDevHost = DEV_HOST.test(storeHost)

function session(get, value) {
  try {
    if (get) return sessionStorage.getItem(MODE_KEY) || ''
    sessionStorage.setItem(MODE_KEY, value)
  } catch {
    return ''
  }
  return ''
}

// A page shown inside another page (the Template Studio's preview, the
// builder's preview). It shares the tab's memory with the page around it, so
// it must not change which site the tab remembers: otherwise the Studio,
// reloaded, would open the demo shop it was previewing.
function inFrame() {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

// 'platform' | 'store:<slug>' | ''  (only meaningful on development hosts)
function devChoice() {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  const store = (params.get('store') || '').toLowerCase()
  const remember = !inFrame()
  if (SLUG.test(store)) {
    if (remember) session(false, `store:${store}`)
    return `store:${store}`
  }
  if (params.has('platform')) {
    if (remember) session(false, 'platform')
    return 'platform'
  }
  const remembered = session(true)
  if (remembered) return remembered
  const fallback = String(import.meta.env?.VITE_DEFAULT_STORE || '').toLowerCase()
  return SLUG.test(fallback) ? `store:${fallback}` : 'platform'
}

const choice = isDevHost ? devChoice() : ''

export const isPlatformSite =
  typeof window === 'undefined'
    ? false
    : PLATFORM_DOMAIN && (storeHost === PLATFORM_DOMAIN || storeHost === `www.${PLATFORM_DOMAIN}`)
      ? true
      : isDevHost
        ? choice === 'platform'
        : false

export const storeSlug = choice.startsWith('store:') ? choice.slice(6) : ''

// A link to a page on the platform site, from anywhere
export function platformUrl(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`
  if (PLATFORM_DOMAIN && !isDevHost) return `https://${PLATFORM_DOMAIN}${p}`
  if (typeof window === 'undefined') return p
  return `${window.location.origin}${p}${p.includes('?') ? '&' : '?'}platform=1`
}

// A link to a page of THIS shop that still works in a new tab. On development
// addresses the shop is remembered per tab, so the link must name it.
export function shopHref(path = '/') {
  if (!storeSlug) return path
  return `${path}${path.includes('?') ? '&' : '?'}store=${encodeURIComponent(storeSlug)}`
}

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

// Every axios request: say which shop, and send the shop login if there is
// one (a shop's owner can then preview it before it is published). The
// platform site sends its own login itself, so it gets no shop login here.
let installed = false
export function installStoreHeaders() {
  if (installed) return
  installed = true
  axios.interceptors.request.use((config) => {
    const headers = config.headers || {}
    const set = (k, v) => (typeof headers.set === 'function' ? headers.set(k, v) : (headers[k] = v))
    const has = (k) => (typeof headers.has === 'function' ? headers.has(k) : headers[k] !== undefined)

    for (const [k, v] of Object.entries(storeHeaders())) set(k, v)
    if (!isPlatformSite && !has('Authorization')) {
      const token = storedUser()?.token
      if (token) set('Authorization', `Bearer ${token}`)
    }
    config.headers = headers
    return config
  })
}
