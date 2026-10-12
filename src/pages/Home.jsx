import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Hero from '../components/Hero'
import FeaturedCollection from '../components/FeaturedCollection'
import b18 from '../assets/img/side-hero2.png'
import { getProducts, getProductsByCategory, getBestSellers } from '../services/productService'
import c2 from '../assets/img/c2.jpg'
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

function Home() {
  const [products, setProducts] = useState([])
  const [sliderProducts, setSliderProducts] = useState([])
  const [bestSellerProducts, setBestSellerProducts] = useState([])

  const [footwearProgress, setFootwearProgress] = useState(0)
  const [bestSellerProgress, setBestSellerProgress] = useState(0)

  const footwearRef = useRef(null)
  const bestSellerRef = useRef(null)

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts()
      setProducts(data)
    }

    const fetchSliderProducts = async () => {
      const data = await getProductsByCategory('shoes')
      setSliderProducts(data)
    }

    const fetchBestSellerProducts = async () => {
      const data = await getBestSellers()
      setBestSellerProducts(data)
    }

    fetchProducts()
    fetchSliderProducts()
    fetchBestSellerProducts()
  }, [])

  const gridProducts = products.slice(30, 38)

  const handleFootwearScroll = () => {
    const el = footwearRef.current
    if (!el) return
    const total = el.scrollWidth - el.clientWidth
    if (total > 0) setFootwearProgress((el.scrollLeft / total) * 100)
  }

  const handleBestSellerScroll = () => {
    const el = bestSellerRef.current
    if (!el) return
    const total = el.scrollWidth - el.clientWidth
    if (total > 0) setBestSellerProgress((el.scrollLeft / total) * 100)
  }

  const scrollBestSellerScroll = (direction) => {
    const el = bestSellerRef.current
    if (!el) return
    const scrollAmount = direction === 'left' ? -300 : 300
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <div className="">
      <Hero className="mb-12" />
      <div className="px-6 md:px-10">
        {/* Section 1 */}
        <div className="mt-12 mb-16 animate-fade-in">
          <h2 className="text-2xl font-poppins mb-2">New Arrivals</h2>
          <p className="text-gray-500 font-epilogue mb-2">Explore the newest drops from Zipp Republic</p>
          <div className="grid grid-cols-1 min-[321px]:grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 gap-6 font-epilogue">
            {gridProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>

        <div className="">
          <p className="text-center font-poppins mb-4">Trending</p>
          <h4 className="text-center text-2xl font-poppins uppercase mb-6">Best Seller</h4>
          <div className="relative mt-6">
            {/* angle left */}
            <button
              onClick={() => scrollBestSellerScroll('left')}
              className="absolute left-2 top-40 translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition-all"
              aria-label="scroll left"
            >
              <ChevronLeftIcon className="w-10 h-10 cursor-pointer" />
            </button>

            {/* Carousel Scroll */}
            <div
              ref={bestSellerRef}
              onScroll={handleBestSellerScroll}
              className="flex overflow-x-auto gap-6 pb-2 snap-x snap-mandatory scrollbar-none scroll-smooth"
            >
              {bestSellerProducts.length === 0 ? (
                <p className="text-gray-500 text-2xl font-poppins mb-2">No Best Seller yet.</p>
              ) : (
                bestSellerProducts.map((product) => (
                  <div key={product._id} className="min-w-[250px] md:min-w-[300px] flex-shrink-0 snap-start">
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>

            {/* angle Right */}
            <button
              onClick={() => scrollBestSellerScroll('right')}
              className="absolute right-2 top-40 translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition-all"
              aria-label="scroll right"
            >
              <ChevronRightIcon className="w-10 h-10 cursor-pointer" />
            </button>

            <div className="w-100 bg-gray-400 m-auto h-0.5 rounded-full overflow-hidden mb-10">
              <div
                className="bg-black h-full transition-all duration-150 ease-out rounded-full"
                style={{ width: `${Math.max(bestSellerProgress, 10)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section 2 - banner */}
        <div
          className="relative w-full h-64 md:h-80 rounded-lg font-poppins overflow-hidden mb-16 flex items-center justify-center text-center text-white bg-gray-900 bg-cover bg-center"
          style={{ backgroundImage: `url(${c2})` }}
        >
          <div className="relative z-10 px-6">
            <h3 className="text-3xl font-bold mb-2">New Season, New Style</h3>
            <p className="mb-4">Check out our latest collection before it sells out</p>
            <Link
              to="/shop"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto w-fit"
            >
              Shop Now
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-poppins mb-2">BEST SHOE'S</h2>
        <div className="relative mt-6">
          <div
            ref={footwearRef}
            onScroll={handleFootwearScroll}
            className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-none"
          >
            {sliderProducts.length === 0 ? (
              <p className="text-gray-500">No footwear products yet.</p>
            ) : (
              sliderProducts.map((product) => (
                <div key={product._id} className="min-w-[250px] md:min-w-[300px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>

          <div className="w-100 bg-gray-400 h-0.5 m-auto mb-20 rounded-full overflow-hidden mt-1">
            <div
              className="bg-black h-full transition-all duration-150 ease-out rounded-full"
              style={{ width: `${Math.max(footwearProgress, 10)}%` }}
            />
          </div>
        </div>
      </div>


      <FeaturedCollection
        products={products.slice(0, 4)}
        image={b18}
        title="ZERO TO THE WORLD"
        buttonText="VIEW"
        buttonLink="/shop"
      />

      {/* <Footer /> */}
    </div>
  )
}

export default Home