import { useState, useEffect } from 'react'
import logo from '../assets/img/yl_png_logo.avif'

// Full-screen loading screen: a ring spinning around the logo.
//   show - true while loading. Set it to false and the screen fades away.
//   slow - true when the wait is getting long, to show a reassuring message.
//
// Want the logo itself to spin instead of the ring? Remove "animate-spin" from the
// first <span> and add it to the <img> below.
function PageLoader({ show = true, slow = false }) {
  const [mounted, setMounted] = useState(show)

  // Stay in the page just long enough to fade out, then disappear completely
  useEffect(() => {
    if (show) {
      setMounted(true)
      return
    }
    const timer = setTimeout(() => setMounted(false), 400)
    return () => clearTimeout(timer)
  }, [show])

  if (!mounted) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading the store"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="relative h-24 w-24">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <img src={logo} alt="" className="absolute inset-0 m-auto h-11 w-11 object-contain" />
      </div>

      <p
        className={`mt-6 max-w-xs px-6 text-center text-sm text-gray-500 transition-opacity duration-500 ${
          slow ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Getting the store ready. This can take a few seconds the first time.
      </p>
    </div>
  )
}

export default PageLoader