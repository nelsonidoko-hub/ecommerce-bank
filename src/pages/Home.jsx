import { useState, useEffect, useMemo } from 'react'
import Hero from '../components/Hero'
import PageLoader from '../components/PageLoader'
import {
  ProductsSection,
  BannerSection,
  FeaturedSection,
  TextSection,
  ImageTextSection,
  TestimonialsSection,
  WhatsAppSection,
} from '../components/sections/Sections'
import { getProducts, getProductsByCategory, getBestSellers } from '../services/productService'
import { useSettings } from '../hooks/useSettings'
import { homeSectionsOf } from '../utils/sections'

// The homepage: whatever sections the merchant arranged in the builder, in
// their order. Products are loaded once and shared between sections.
function Home() {
  const { settings, loaded } = useSettings()
  const sections = useMemo(() => homeSectionsOf(settings).filter((s) => s.enabled !== false), [settings])

  const [newest, setNewest] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [byCategory, setByCategory] = useState({})

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

  const hasHero = sections.some((s) => s.type === 'hero')
  // A failed request still counts as "done", so the page can never hang on an error
  const ready = loaded && productsReady && bestSellersReady && (heroReady || !hasHero)

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

  useEffect(() => {
    getProducts()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setNewest([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      })
      .catch((err) => console.error(err))
      .finally(() => setProductsReady(true))

    getBestSellers()
      .then((data) => setBestSellers(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setBestSellersReady(true))
  }, [])

  // Each category a section asks for, fetched once
  const wanted = useMemo(() => {
    const names = new Set()
    for (const s of sections) {
      if (s.type === 'products' && s.data?.source === 'category' && s.data.category) names.add(s.data.category)
      if (s.type === 'featured' && s.data?.category) names.add(s.data.category)
    }
    return [...names]
  }, [sections])

  useEffect(() => {
    for (const name of wanted) {
      if (byCategory[name]) continue
      setByCategory((prev) => ({ ...prev, [name]: [] }))
      getProductsByCategory(name)
        .then((data) => setByCategory((prev) => ({ ...prev, [name]: Array.isArray(data) ? data : [] })))
        .catch(() => {})
    }
  }, [wanted]) // eslint-disable-line react-hooks/exhaustive-deps

  function productsFor(data) {
    if (data.source === 'bestsellers') return bestSellers
    if (data.source === 'category') return byCategory[data.category] || []
    return newest
  }

  function render(section) {
    const data = section.data || {}
    switch (section.type) {
      case 'hero':
        return <Hero key={section.id} onReady={() => setHeroReady(true)} />
      case 'products':
        return <ProductsSection key={section.id} data={data} products={productsFor(data)} />
      case 'banner':
        return <BannerSection key={section.id} data={data} />
      case 'featured':
        return (
          <FeaturedSection
            key={section.id}
            data={data}
            products={data.category ? byCategory[data.category] || [] : newest}
            storeName={settings.storeName}
          />
        )
      case 'text':
        return <TextSection key={section.id} data={data} />
      case 'imageText':
        return <ImageTextSection key={section.id} data={data} storeName={settings.storeName} />
      case 'testimonials':
        return <TestimonialsSection key={section.id} data={data} />
      case 'whatsapp':
        return <WhatsAppSection key={section.id} data={data} whatsappNumber={settings.whatsappNumber} isPreview={settings.isPreview} />
      default:
        return null // a type this version doesn't know yet
    }
  }

  return (
    <div>
      <PageLoader show={showLoader} slow={slow} />
      {/* No banner slideshow: leave room for the navbar */}
      {!hasHero && <div className="h-20 sm:h-28" />}
      {sections.map(render)}
    </div>
  )
}

export default Home
