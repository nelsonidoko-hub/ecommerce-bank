import { Link } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'

// Height in px. The navbar uses this to sit directly below the bar.
// Keep it in sync with the h-9 class below (h-9 = 36px).
export const ANNOUNCEMENT_BAR_HEIGHT = 66

function AnnouncementBar() {
  const { settings } = useSettings()
  const { enabled, text, link } = settings.announcement

  if (!enabled || !text) return null

  const isExternal = /^https?:\/\//.test(link || '')
  const className = 'hover:underline'

  return (
    <div className="h-9 w-full bg-black text-white text-xs sm:text-sm px-4 flex items-center justify-center text-center">
      <span className="truncate">
        {link ? (
          isExternal ? (
            <a href={link} target="_blank" rel="noreferrer" className={className}>
              {text}
            </a>
          ) : (
            <Link to={link} className={className}>
              {text}
            </Link>
          )
        ) : (
          text
        )}
      </span>
    </div>
  )
}

export default AnnouncementBar