import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import slide1 from '../assets/img/slide-1.jpg'
import slide2 from '../assets/img/slide-2.png'
import slide3 from '../assets/img/slide-3.jpg'
import b10 from '../assets/img/b10.jpg'
import b16 from '../assets/img/b16.jpg'
import bag1 from '../assets/img/bag-hero1.png'
import bag2 from '../assets/img/bag-hero2.png'
import bag3 from '../assets/img/bag-hero4.png'
import b18 from '../assets/img/b18.jpg'
import b100 from '../assets/img/b100.jpeg'
import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon, ChevronDownIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline'


const slides = [
  { image: bag1, heading: 'Future-Ready Fashion', text: 'Shop the new collection' },
  { image: bag2, heading: 'Baby Essentials', text: 'Gentle care for little ones' },
  { image: bag3, heading: 'Everyday Bags', text: 'Style meets function' },
]


function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = slides[currentSlide]
  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-[60vh] sm:h-screen w-full bg-no-repeat bg-cover bg-center flex flex-col items-center justify-center text-center text-white"style={{ backgroundImage: `url(${slide.image})` }}>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-0">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 font-poppins mb-3 sm:mb-4">{slide.heading}</h1>
        <p className="mb-6 font-poppins">{slide.text}</p>
        <Link
          to="/shop"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
        >
          Shop Now
          <ArrowRightIcon className="h-5 w-5" />
        </Link>

        <div className="flex gap-3 mt-8 border-b-2 border-black pb-1">
          {slides.map((s, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={
                index === currentSlide
                  ? 'text-white font-bold border-b-2 border-white -mb-[6px] w-20 pb-1 font-poppins '
                  : 'text-white/60 pb-1 font-poppins m-auto cursor-pointer'
              }
            >
              {String(index + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


export default Hero