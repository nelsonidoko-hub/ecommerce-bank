import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE } from '../config'

// Is this shop open, and (for its owner) what plan and trial it is on.
// Fetched once per page load and shared by everything that asks.
//   status.live      open to the public
//   status.state     'open' | 'offline' | 'unavailable' | 'missing' | 'error'
//   status.manage    only for the people who run the shop: state, plan, dates
let cached = null
let pending = null
const listeners = new Set()

export function loadStoreStatus(force = false) {
  if (cached && !force) return Promise.resolve(cached)
  if (pending && !force) return pending
  pending = axios
    .get(`${API_BASE}/api/store/status`)
    .then((res) => res.data)
    .catch((error) => {
      if (error.response?.data?.code === 'STORE_NOT_FOUND') return { live: false, state: 'missing' }
      // Network trouble: don't lock the shop, just carry on as open
      return { live: true, state: 'error' }
    })
    .then((data) => {
      cached = data
      pending = null
      listeners.forEach((fn) => fn(data))
      return data
    })
  return pending
}

export function useStoreStatus() {
  const [status, setStatus] = useState(cached)
  useEffect(() => {
    listeners.add(setStatus)
    loadStoreStatus().then(setStatus)
    return () => listeners.delete(setStatus)
  }, [])
  return status
}
