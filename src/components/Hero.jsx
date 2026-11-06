import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { getHeroSlides } from '../services/heroService'
import bag1 from '../assets/img/bag-hero1.png'
import bag2 from '../assets/img/bag-hero2.png'
import bag3 from '../assets/img/bag-hero4.png'

// Shown only when no slides have been added in the admin panel yet,
// so the homepage is never blank.
const fallbackSlides = [
  {
    _id: 'fallback-1',
    mediaType: 'image',
    mediaUrl: bag1,
    heading: 'Your Eyes Your Look',
    text: 'Shop the new collection',
    buttonLabel: 'Shop Now',
    buttonLink: '/shop',
  },
  {
    _id: 'fallback-2',
    mediaType: 'image',
    mediaUrl: bag2,
    heading: 'Blue Cut Edges',
    text: 'Gentle care for little ones',
    buttonLabel: 'Shop Now',
    buttonLink: '/shop',
  },
  {
    _id: 'fallback-3',
    mediaType: 'image',
    mediaUrl: bag3,
    heading: 'Everyday Eyes Styling',
    text: 'Style meets function',
    buttonLabel: 'Shop Now',
    buttonLink: '/shop',
  },
]

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

  useEffect(() => {
    getHeroSlides()
      .then((data) => {
        const list = Array.isArray(data) && data.length > 0 ? data : fallbackSlides
        setSlides(list)
        setCurrentSlide(0)
        return list
      })
      .catch((err) => {
        console.error(err)
        setSlides(fallbackSlides)
        return fallbackSlides
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

  const containerClass =
    'relative min-h-[60vh] sm:h-screen w-full overflow-hidden bg-gray-900 flex flex-col items-center justify-center text-center text-white'

  // Avoid flashing fallback content before the real slides arrive
  if (!loaded || !slide) {
    return <div className={containerClass} />
  }

  const isExternalLink = /^https?:\/\//.test(slide.buttonLink || '')
  const buttonClass =
    'bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto w-fit'

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