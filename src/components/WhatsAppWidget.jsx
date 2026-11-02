import { FaWhatsapp } from 'react-icons/fa'
import { useSettings } from '../hooks/useSettings'

// Turns whatever the owner typed into the digits wa.me needs:
// country code first, no plus sign, spaces or leading zero.
//   "0801 234 5678"      -> "2348012345678"
//   "+234 801 234 5678"  -> "2348012345678"
//   "2348012345678"      -> "2348012345678"
export function toWhatsAppNumber(raw) {
  let digits = String(raw || '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = `234${digits.slice(1)}`
  return digits
}

function WhatsAppWidget() {
  const { settings } = useSettings()
  const number = toWhatsAppNumber(settings.whatsappNumber)

  // No number saved (or clearly not a phone number): show nothing
  // rather than a button that goes nowhere.
  if (number.length < 8) return null

  const message = `Hello ${settings.storeName}, I'd like to ask about...`
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-3 sm:bottom-6 sm:right-6"
    >
      <span className="hidden rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-lg sm:block">
        Chat With Us
      </span>

      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
        <FaWhatsapp className="relative h-8 w-8" />
      </span>
    </a>
  )
}

export default WhatsAppWidget