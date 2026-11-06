import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Hero from '../components/Hero'
import FeaturedCollection from '../components/FeaturedCollection'
import PageLoader from '../components/PageLoader'
import b18 from '../assets/img/side-hero2.png'
import c2 from '../assets/img/c2.jpg'
import { getProducts, getProductsByCategory, getBestSellers } from '../services/productService'
import { useSettings } from '../hooks/useSettings'
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

function Home() {
  const { settings, loaded } = useSettings()
  const { homeArrivals, homeBestSellers, homeBanner, homeCategoryRow, homeFeatured } = settings

  const [products, setProducts] = useState([])
  const [sliderProducts, setSliderProducts] = useState([])
  const [bestSellerProducts, setBestSellerProducts] = useState([])
  const [featuredByCategory, setFeaturedByCategory] = useState(null)

  // Loading screen. It shows on the first visit of a browser session, until the
  // backend has answered. That also covers a slow wake-up on free hosting.
  const [firstVisit] = useState(() => {
    try {
      return !sessionStorage.getItem('home_loaded')
    } catch {
      return true
    }
  })
  const [productsReady, setProductsReady] = useState(false)
  const [bestSellersReady, setBestSellersReady] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const [slow, setSlow] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)

  // A failed request still counts as "done", so the page can never hang on an error
  const ready = loaded && productsReady && bestSellersReady && heroReady

  useEffect(() => {
    const timers = [
      setTimeout(() => setMinElapsed(true), 500), // avoids a flash when everything is instant
      setTimeout(() => setSlow(true), 6000), // then reassure the visitor
      setTimeout(() => setGaveUp(true), 90000), // never spin forever
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      sessionStorage.setItem('home_loaded', '1')
    } catch {
      // storage unavailable: the loader just shows again next time
    }
  }, [ready])

  const showLoader = firstVisit && !((ready && minElapsed) || gaveUp)

  const [categoryRowProgress, setCategoryRowProgress] = useState(0)
  const [bestSellerProgress, setBestSellerProgress] = useState(0)

  const categoryRowRef = useRef(null)
  const bestSellerRef = useRef(null)

  // Products and best sellers don't depend on settings
  useEffect(() => {
    getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setProductsReady(true))

    getBestSellers()
      .then((data) => setBestSellerProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setBestSellersReady(true))
  }, [])

  // The category row follows whichever category the admin picked
  useEffect(() => {
    if (!loaded) return
    const slug = homeCategoryRow.category
    if (!homeCategoryRow.enabled || !slug) {
      setSliderProducts([])
      return
    }
    getProductsByCategory(slug)
      .then((data) => setSliderProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err)
        setSliderProducts([])
      })
  }, [loaded, homeCategoryRow.enabled, homeCategoryRow.category])

  // Featured collection: a chosen category, or the newest products if none is chosen
  useEffect(() => {
    if (!loaded) return
    const slug = homeFeatured.category
    if (!homeFeatured.enabled || !slug) {
      setFeaturedByCategory(null)
      return
    }
    getProductsByCategory(slug)
      .then((data) => setFeaturedByCategory(Array.isArray(data) ? data : null))
      .catch(() => setFeaturedByCategory(null))
  }, [loaded, homeFeatured.enabled, homeFeatured.category])

  const newestProducts = [...products].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  const gridProducts = newestProducts.slice(0, Number(homeArrivals.count) || 8)
  const featuredProducts = (featuredByCategory || newestProducts).slice(0, 4)

  const handleCategoryRowScroll = () => {
    const el = categoryRowRef.current
    if (!el) return
    const total = el.scrollWidth - el.clientWidth
    if (total > 0) setCategoryRowProgress((el.scrollLeft / total) * 100)
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

  const bannerLinkIsExternal = /^https?:\/\//.test(homeBanner.buttonLink || '')
  const bannerButtonClass =
    'bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto w-fit'

  return (
    <div className="">
      <PageLoader show={showLoader} slow={slow} />
      <Hero onReady={() => setHeroReady(true)} />
      <div className="px-6 md:px-10">
        {/* New arrivals */}
        {homeArrivals.enabled && (
          <div className="mt-12 mb-16 animate-fade-in">
            <h2 className="text-2xl font-poppins mb-2">{homeArrivals.title}</h2>
            {homeArrivals.subtitle && (
              <p className="text-gray-500 font-epilogue mb-2">{homeArrivals.subtitle}</p>
            )}
            <div className="grid grid-cols-1 min-[321px]:grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 gap-6 font-epilogue">
              {gridProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Best sellers */}
        {homeBestSellers.enabled && (
          <div className="">
            {homeBestSellers.label && (
              <p className="text-center font-poppins mb-4">{homeBestSellers.label}</p>
            )}
            <h4 className="text-center text-2xl font-poppins uppercase mb-6">
              {homeBestSellers.title}
            </h4>
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
        )}

        {/* Promo banner */}
        {homeBanner.enabled && (
          <div
            className="relative w-full h-64 md:h-80 rounded-lg font-poppins overflow-hidden mb-16 flex items-center justify-center text-center text-white bg-gray-900 bg-cover bg-center"
            style={{ backgroundImage: `url(${homeBanner.image || c2})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 px-6">
              {homeBanner.heading && (
                <h3 className="text-3xl font-bold mb-2">{homeBanner.heading}</h3>
              )}
              {homeBanner.text && <p className="mb-4">{homeBanner.text}</p>}
              {homeBanner.buttonLabel &&
                homeBanner.buttonLink &&
                (bannerLinkIsExternal ? (
                  <a
                    href={homeBanner.buttonLink}
                    target="_blank"
                    rel="noreferrer"
                    className={bannerButtonClass}
                  >
                    {homeBanner.buttonLabel}
                    <ArrowRightIcon className="h-5 w-5" />
                  </a>
                ) : (
                  <Link to={homeBanner.buttonLink} className={bannerButtonClass}>
                    {homeBanner.buttonLabel}
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Category row */}
        {homeCategoryRow.enabled && homeCategoryRow.category && (
          <>
            <h2 className="text-2xl font-poppins mb-2">{homeCategoryRow.title}</h2>
            <div className="relative mt-6">
              <div
                ref={categoryRowRef}
                onScroll={handleCategoryRowScroll}
                className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-none"
              >
                {sliderProducts.length === 0 ? (
                  <p className="text-gray-500">No products in this category yet.</p>
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
                  style={{ width: `${Math.max(categoryRowProgress, 10)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Featured collection */}
      {homeFeatured.enabled && (
        <FeaturedCollection
          products={featuredProducts}
          image={homeFeatured.image || b18}
          title={homeFeatured.title}
          buttonText={homeFeatured.buttonLabel}
          buttonLink={homeFeatured.buttonLink}
        />
      )}
    </div>
  )
}

export default Home