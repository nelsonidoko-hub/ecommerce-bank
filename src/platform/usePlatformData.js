import { useEffect, useState } from 'react'
import { getDemos, getPlans } from '../services/platformService'

// Plans (prices from the server's Render settings) and the demo shop for each
// template. Loaded once and shared between pages.
let plansCache = null
let demosCache = null

export function usePlans() {
  const [data, setData] = useState(plansCache)
  useEffect(() => {
    if (plansCache) return
    getPlans()
      .then((d) => setData((plansCache = d)))
      .catch(() => setData({ plans: [], trialDays: 7, failed: true }))
  }, [])
  return data
}

// { [templateId]: demoUrl }
export function useDemos() {
  const [data, setData] = useState(demosCache || {})
  useEffect(() => {
    if (demosCache) return
    getDemos()
      .then((list) => setData((demosCache = Object.fromEntries(list.map((d) => [d.template, d.url])))))
      .catch(() => setData({}))
  }, [])
  return data
}

export const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`
