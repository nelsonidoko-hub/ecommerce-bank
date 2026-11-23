import { Navigate } from 'react-router-dom'
import { getAccount } from '../../../services/platformService'

export const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`
export const day = (d) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

export const STATES = {
  draft: ['Draft', 'bg-slate-100 text-slate-700'],
  trial: ['Trial', 'bg-sky-100 text-sky-800'],
  active: ['Paying', 'bg-emerald-100 text-emerald-800'],
  grace: ['Overdue', 'bg-amber-100 text-amber-800'],
  paused: ['Paused', 'bg-red-100 text-red-700'],
  suspended: ['Suspended', 'bg-red-200 text-red-800'],
}

export function StateChip({ state }) {
  const [label, cls] = STATES[state] || STATES.draft
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
}

// Only the platform owner gets in; everyone else goes back to their shops
export function FounderOnly({ children }) {
  const account = getAccount()
  if (!account) return <Navigate to="/login" replace />
  if (account.role !== 'superadmin') return <Navigate to="/dashboard" replace />
  return children
}

export const ACTION_LABELS = {
  suspend: 'Suspended',
  unsuspend: 'Restored',
  'extend-trial': 'Extended trial',
  'free-months': 'Gave free months',
  plan: 'Changed plan',
  'market-hide': 'Hid from Market Square',
  'market-unhide': 'Showed in Market Square again',
  'close-reports': 'Closed market reports',
}

export const REPORT_REASONS = {
  fake: 'Fake or counterfeit',
  scam: 'Looks like a scam',
  offensive: 'Offensive or not allowed',
  'wrong-info': 'Wrong price or details',
  other: 'Other',
}
