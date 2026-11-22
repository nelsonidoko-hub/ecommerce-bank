import { useState, useEffect } from 'react'
import { useSettings } from './useSettings'
import { getOpenStatus } from '../utils/openingHours'

// Whether the shop is open right now, based on the opening hours in the store settings.
// Re-checks every minute so the badge flips at opening and closing time without a reload.
//   { enabled, open, text, opensText, whenClosed }
export function useOpenStatus() {
  const { settings } = useSettings()
  const hours = settings.hours
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!hours?.enabled) return
    const id = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(id)
  }, [hours?.enabled])

  return { ...getOpenStatus(hours, now), whenClosed: hours?.whenClosed || 'block' }
}
