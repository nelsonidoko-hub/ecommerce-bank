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
import { useStoreTheme } from '../hooks/useStoreTheme'
import { getCategories } from '../services/categoryService'
import { packComponent } from '../storefront/parts'
import { Link } from 'react-router-dom'

// The homepage: whatever sections the merchant arranged in the builder, in
// their order. Products are loaded once and shared between sections.
function Home() {
  const { settings, loaded } = useSettings()
  const { layout } = useStoreTheme()
  // "No banner" templates leave the banner out, whatever the sections say
  const sections = useMemo(
    () => homeSectionsOf(settings).filter((s) => s.enabled !== false && !(layout.hero === 'none' && s.type === 'hero')),
    [settings, layout.hero]
  )
  const [categories, setCategories] = useState([])
  useEffect(() => {
    if (layout.home !== 'sidebar' && layout.home !== 'lookbook') return
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [layout.home])

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

  const loader = <PageLoader show={showLoader} slow={slow} />
  const heroFirst = sections[0]?.type === 'hero'
  const top = heroFirst ? render(sections[0]) : <div className="h-20 sm:h-28" />
  const rest = heroFirst ? sections.slice(1) : sections

  // A homepage from a template pack (storefront/packs) draws everything itself
  const PackHome = packComponent('home', layout.home)
  if (PackHome) {
    return (
      <div>
        {loader}
        <PackHome settings={settings} sections={sections} renderSection={render} products={{ newest, bestSellers }} />
      </div>
    )
  }

  // Sidebar catalog (e.g. Gadget): categories beside the products
  if (layout.home === 'sidebar') {
    return (
      <div>
        {loader}
        {top}
        <div className="mx-auto max-w-[90rem] lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6 lg:px-6">
          <CategorySidebar categories={categories} />
          <div className="min-w-0">{rest.map(render)}</div>
        </div>
      </div>
    )
  }

  // Lookbook (e.g. Atelier): big "shop by category" photos, then the products
  if (layout.home === 'lookbook') {
    return (
      <div>
        {loader}
        {top}
        <CategoryTiles categories={categories} products={newest} />
        {rest.map(render)}
      </div>
    )
  }

  return (
    <div>
      {loader}
      {/* No banner slideshow: leave room for the navbar */}
      {!hasHero && <div className="h-20 sm:h-28" />}
      {sections.map(render)}
    </div>
  )
}

export default Home

// Sidebar catalog: a sticky list of categories on computers, a row of
// scrollable chips on phones
function CategorySidebar({ categories }) {
  const top = categories.filter((c) => !c.parent)
  return (
    <aside className="lg:py-8">
      <nav aria-label="Categories" className="flex gap-2 overflow-x-auto px-4 py-3 lg:sticky lg:top-32 lg:flex-col lg:gap-0 lg:overflow-visible lg:rounded-md lg:border lg:border-gray-200 lg:bg-white lg:p-2">
        <p className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 lg:block">Categories</p>
        <Link to="/shop" className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-800 lg:rounded-md lg:border-0 lg:hover:bg-gray-100">
          All products
        </Link>
        {top.map((c) => (
          <Link key={c._id || c.name} to={`/category/${c.name}`} className="shrink-0 whitespace-nowrap rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-800 lg:rounded-md lg:border-0 lg:hover:bg-gray-100">
            {c.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

// Lookbook: up to 4 categories as big portrait photos (each uses the newest
// product picture in that category)
function CategoryTiles({ categories, products }) {
  const tiles = categories
    .filter((c) => !c.parent)
    .map((c) => ({ ...c, image: products.find((p) => p.category === c.name)?.image }))
    .filter((c) => c.image)
    .slice(0, 4)
  if (!tiles.length) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <h2 className="font-poppins text-center text-2xl font-bold text-gray-900 sm:text-3xl">Shop by category</h2>
      <div className={`mt-8 grid grid-cols-2 gap-3 sm:gap-6 ${{ 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[tiles.length] || ''}`}>
        {tiles.map((c) => (
          <Link key={c._id || c.name} to={`/category/${c.name}`} className="group relative block aspect-[3/4] overflow-hidden rounded-md bg-gray-100">
            <img src={c.image} alt={c.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 font-poppins text-lg font-semibold text-white">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
