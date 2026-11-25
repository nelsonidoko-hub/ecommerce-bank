import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { getHeroSlides } from '../services/heroService'
import { useStoreTheme } from '../hooks/useStoreTheme'
import { useSettings } from '../hooks/useSettings'
import { placeholderPicture } from '../utils/placeholderPicture'
import OpenStatusBadge from './OpenStatusBadge'

// Shown only when no slides have been added in the admin panel yet, so the
// homepage is never blank: a plain banner with the shop's name.
function fallbackSlides(storeName) {
  return [
    {
      _id: 'fallback-1',
      mediaType: 'image',
      mediaUrl: placeholderPicture(storeName),
      heading: storeName ? `Welcome to ${storeName}` : 'Welcome',
      text: 'Shop the collection',
      buttonLabel: 'Shop Now',
      buttonLink: '/shop',
    },
  ]
}

const IMAGE_DURATION = 3000 // ms each image stays on screen
const VIDEO_MAX_DURATION = 30000 // safety cap if a video stalls or is very long

// Resolves when the first slide's picture has downloaded (or failed, or 5 seconds
// have passed), so a slow image can never hold the whole page hostage.
function preloadFirstImage(list) {
  const first = list[0]
  if (!first || first.mediaType === 'video') return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = resolve
    img.onerror = resolve
    img.src = first.mediaUrl
    setTimeout(resolve, 5000)
  })
}

function Hero({ onReady }) {
  const [slides, setSlides] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { layout } = useStoreTheme()
  const { settings } = useSettings()
  // Read when the fallback is built (the slides load once, settings may arrive after)
  const storeNameRef = useRef(settings.storeName)
  storeNameRef.current = settings.storeName

  useEffect(() => {
    getHeroSlides()
      .then((data) => {
        const list = Array.isArray(data) && data.length > 0 ? data : fallbackSlides(storeNameRef.current)
        setSlides(list)
        setCurrentSlide(0)
        return list
      })
      .catch((err) => {
        console.error(err)
        setSlides(fallbackSlides(storeNameRef.current))
        return fallbackSlides(storeNameRef.current)
      })
      // Wait for the first picture, so the hero never appears as an empty dark box
      .then((list) => preloadFirstImage(list))
      .finally(() => {
        setLoaded(true)
        if (onReady) onReady()
      })
  }, [])

  const multiple = slides.length > 1
  const slide = slides[currentSlide] || slides[0]

  function goNext() {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  // Auto-advance. Images use a fixed timer; videos advance when they end
  // (see onEnded below), with a max-duration cap as a safety net.
  useEffect(() => {
    if (!slide || !multiple) return
    const delay = slide.mediaType === 'video' ? VIDEO_MAX_DURATION : IMAGE_DURATION
    const timer = setTimeout(goNext, delay)
    return () => clearTimeout(timer)
  }, [currentSlide, slides])

  // Full screen by default; some templates (like Fresh) use a shorter banner
  const heroHeight =
    {
      compact: 'min-h-[45vh] sm:h-[60vh]',
      // Catalog: a short strip, so products show without scrolling
      slim: 'min-h-[40vh] sm:min-h-[45vh] py-24',
    }[layout.hero] || 'min-h-[60vh] sm:h-screen'
  const containerClass = `relative ${heroHeight} w-full overflow-hidden bg-gray-900 flex flex-col items-center justify-center text-center text-white`

  // Avoid flashing fallback content before the real slides arrive
  if (!loaded || !slide) {
    return layout.hero === 'split' ? <div className="min-h-[55vh] pt-16 lg:pt-28 md:min-h-[80vh]" /> : <div className={containerClass} />
  }

  const isExternalLink = /^https?:\/\//.test(slide.buttonLink || '')
  const buttonClass =
    'bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto w-fit'

  // Split screen (e.g. Atelier): the photo on one side, the words on the
  // other, on the shop's own background instead of over the photo
  if (layout.hero === 'split') {
    return (
      <div className="grid w-full pt-16 lg:pt-28 md:grid-cols-2">
        <div className="relative min-h-[55vh] overflow-hidden bg-gray-200 md:min-h-[80vh]">
          {slide.mediaType === 'video' ? (
            <video key={slide._id} src={slide.mediaUrl} className="absolute inset-0 h-full w-full object-cover" autoPlay muted playsInline loop={!multiple} onEnded={multiple ? goNext : undefined} onError={multiple ? goNext : undefined} />
          ) : (
            <img key={slide._id} src={slide.mediaUrl} alt={slide.heading || ''} className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
          <OpenStatusBadge className="mb-4 self-start" />
          {slide.heading && <h1 className="font-poppins text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">{slide.heading}</h1>}
          {slide.text && <p className="mt-4 max-w-md text-lg text-gray-600">{slide.text}</p>}
          {slide.buttonLabel && slide.buttonLink && (
            isExternalLink ? (
              <a href={slide.buttonLink} target="_blank" rel="noreferrer" className={`${buttonClass} mx-0 mt-8`}>
                {slide.buttonLabel} <ArrowRightIcon className="h-5 w-5" />
              </a>
            ) : (
              <Link to={slide.buttonLink} className={`${buttonClass} mx-0 mt-8`}>
                {slide.buttonLabel} <ArrowRightIcon className="h-5 w-5" />
              </Link>
            )
          )}
          {multiple && (
            <div className="mt-10 flex gap-3">
              {slides.map((s, index) => (
                <button
                  key={s._id || index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-10 bg-gray-900' : 'w-5 bg-gray-300'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {/* Background media */}
      {slide.mediaType === 'video' ? (
        <video
          key={slide._id}
          src={slide.mediaUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          loop={!multiple}
          onEnded={multiple ? goNext : undefined}
          onError={multiple ? goNext : undefined}
        />
      ) : (
        <img
          key={slide._id}
          src={slide.mediaUrl}
          alt={slide.heading || ''}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-0">
        <OpenStatusBadge className="mb-4" />
        {slide.heading && (
          <h1 className="text-2xl sm:text-4xl font-bold font-poppins mb-3 sm:mb-4">
            {slide.heading}
          </h1>
        )}
        {slide.text && <p className="mb-6 font-poppins">{slide.text}</p>}

        {slide.buttonLabel &&
          slide.buttonLink &&
          (isExternalLink ? (
            <a href={slide.buttonLink} target="_blank" rel="noreferrer" className={buttonClass}>
              {slide.buttonLabel}
              <ArrowRightIcon className="h-5 w-5" />
            </a>
          ) : (
            <Link to={slide.buttonLink} className={buttonClass}>
              {slide.buttonLabel}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          ))}

        {multiple && (
          <div className="flex gap-3 mt-8 border-b-2 border-black pb-1">
            {slides.map((s, index) => (
              <button
                key={s._id || index}
                onClick={() => setCurrentSlide(index)}
                className={
                  index === currentSlide
                    ? 'text-white font-bold border-b-2 border-white -mb-[6px] w-20 pb-1 font-poppins'
                    : 'text-white/60 pb-1 font-poppins m-auto cursor-pointer'
                }
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero