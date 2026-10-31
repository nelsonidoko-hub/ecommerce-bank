import { useState, useEffect } from 'react'
import { getSettings } from '../services/settingsService'

// Used until the real settings arrive, or if the request fails,
// so the footer and checkout never break. Mirrors the backend defaults.
export const defaultSettings = {
  storeName: 'Abuja Store',
  contactEmail: '',
  contactPhone: '',
  whatsappNumber: '',
  address: { line1: '', city: '', state: '', country: 'Nigeria' },
  social: { instagram: '', x: '', tiktok: '' },
  shipping: { flatRate: 3500, freeShippingThreshold: 0 },
  tax: { rate: 7.5, label: 'VAT' },
  pickup: {
    enabled: true,
    name: 'Main Retail Store',
    address: '',
    readyTime: 'Usually ready in 2 to 4 hours',
  },
  announcement: { enabled: false, text: '', link: '' },
}

// One shared copy, so the navbar, footer and checkout make a single request
let cached = null
let pending = null

// Call after saving in the admin so this tab shows the new values immediately
export function setCachedSettings(next) {
  cached = next
}

export function useSettings() {
  const [settings, setSettings] = useState(cached || defaultSettings)
  const [loaded, setLoaded] = useState(Boolean(cached))

  useEffect(() => {
    if (cached) return

    if (!pending) {
      pending = getSettings()
        .then((data) => {
          cached = data
          return data
        })
        .catch((err) => {
          console.error('Could not load store settings', err)
          return null
        })
        .finally(() => {
          pending = null
        })
    }

    pending.then((data) => {
      if (data) setSettings(data)
      setLoaded(true)
    })
  }, [])

  return { settings, loaded }
}