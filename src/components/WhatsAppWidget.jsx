import { useState } from 'react'

const WHATSAPP_NUMBER = '08132175951' // replace with the client's real number, country code first, no + or spaces
const DEFAULT_MESSAGE = "Hi! I'd like to ask about a product."

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M16.004 3C9.374 3 4 8.373 4 15c0 2.34.666 4.523 1.82 6.375L4 29l7.82-1.773A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75a9.7 9.7 0 0 1-4.95-1.36l-.355-.21-4.64 1.05 1.05-4.52-.23-.37A9.68 9.68 0 0 1 5.25 15c0-5.93 4.82-10.75 10.754-10.75S26.75 9.07 26.75 15 21.938 24.75 16.004 24.75Zm5.44-7.36c-.298-.15-1.76-.87-2.033-.97-.273-.1-.472-.15-.67.15-.2.3-.77.97-.943 1.17-.174.2-.348.223-.645.075-.298-.15-1.258-.464-2.397-1.48-.886-.79-1.485-1.765-1.659-2.065-.173-.3-.018-.462.13-.61.135-.134.298-.348.447-.523.15-.174.2-.3.298-.498.1-.2.05-.373-.025-.523-.075-.15-.67-1.613-.918-2.21-.242-.58-.487-.502-.67-.512l-.57-.01c-.2 0-.523.075-.796.373-.273.298-1.043 1.02-1.043 2.49 0 1.47 1.068 2.89 1.217 3.09.15.2 2.1 3.21 5.09 4.5.712.307 1.267.49 1.7.627.714.227 1.364.195 1.878.118.573-.086 1.76-.72 2.01-1.414.248-.694.248-1.29.173-1.414-.074-.124-.273-.198-.57-.348Z" />
    </svg>
  )
}

function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const chatUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="bg-white rounded-xl shadow-xl w-72 overflow-hidden border">
          <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-2">
            <WhatsAppIcon className="h-6 w-6" />
            <div>
              <p className="font-semibold text-sm">Chat with us</p>
              <p className="text-xs text-green-100">Usually replies within a few hours</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              Got a question about sizing, an order, or anything else? Message us directly on WhatsApp.
            </p>
            <a
              href={chatUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
            >
              Start chat
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat on WhatsApp"
        className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg transition"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </button>
    </div>
  )
}

export default WhatsAppWidget