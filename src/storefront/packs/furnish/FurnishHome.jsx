// Adapted from "Furnish", a free Bootstrap furniture template.
// Design and code © CodesCandy (https://codescandy.com), MIT licence,
// distributed by ThemeWagon (https://themewagon.com). Rebuilt in React and
// Tailwind for ShopBuilder; the original photos are not included.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`
const off = (p) => (p.onSale && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0)

// The Furnish homepage:
//   1. a slider of the shop's best pieces: a sale tag in italics, a big
//      thin heading, the photo, the price and "View details"
//   2. the first product row as "Our favourite collection": a big heading
//      and a slider of photos with centred names and prices
//   3. the first customer review on a white card over a large photo
//   4. the merchant's other sections
// Props come from pages/Home.jsx.
function FurnishHome({ settings, sections, renderSection, products, productsFor }) {
  const list = sections.filter((s) => s.type !== 'hero')
  const collection = list.find((s) => s.type === 'products')
  const review = list.find((s) => s.type === 'testimonials' && (s.data?.items || []).some((i) => i.quote))
  const rest = list.filter((s) => s !== collection && s !== review)

  const slides = (products.bestSellers.length ? products.bestSellers : products.newest).slice(0, 3)
  const collectionItems = collection ? (productsFor ? productsFor(collection.data || {}) : products.newest).slice(0, Number(collection.data?.count) || 9) : []
  const quote = review?.data?.items?.find((i) => i.quote)
  const backdrop = list.find((s) => ['banner', 'featured', 'imageText'].includes(s.type) && s.data?.image)?.data?.image || slides[1]?.image || slides[0]?.image

  return (
    <div className="pt-20 sm:pt-24">
      {slides.length > 0 ? <HeroSlider slides={slides} /> : <p className="py-20 text-center text-gray-500">Add a product to see it here.</p>}

      {collection && collectionItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
          <div className="mb-8 max-w-xl md:mb-12">
            <h2 className="font-poppins text-4xl font-normal leading-tight text-gray-900 sm:text-5xl">{collection.data?.title || 'Our favourite collection'}</h2>
            {collection.data?.subtitle && <p className="mt-4 text-lg text-gray-600">{collection.data.subtitle}</p>}
          </div>
          <CollectionSlider items={collectionItems} />
        </section>
      )}

      {quote && (
        <section className="relative bg-gray-800 bg-cover bg-center px-6 py-16 lg:py-28" style={backdrop ? { backgroundImage: `url("${backdrop}")` } : undefined}>
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          <figure className="relative mx-auto max-w-3xl bg-white p-8 text-center shadow-2xl sm:p-12">
            <blockquote className="text-lg italic text-gray-700">“{quote.quote}”</blockquote>
            {quote.name && <figcaption className="mt-4 font-poppins text-gray-900">{quote.name}</figcaption>}
          </figure>
        </section>
      )}

      <div className="pt-12">{rest.map(renderSection)}</div>
    </div>
  )
}

function HeroSlider({ slides }) {
  const [at, setAt] = useState(0)
  const n = slides.length
  useEffect(() => {
    if (n < 2) return undefined
    const timer = setInterval(() => setAt((i) => (i + 1) % n), 6000)
    return () => clearInterval(timer)
  }, [n])
  const p = slides[Math.min(at, n - 1)]
  const sale = off(p)
  return (
    <section className="mx-auto max-w-5xl px-6 py-6 lg:py-12">
      <div className="relative bg-gray-50 px-6 py-8 sm:px-12 sm:py-12">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="text-center md:text-left">
            <p className="font-poppins text-2xl italic text-blue-600">{sale ? `${sale}% off` : 'New in'}</p>
            <h1 className="mt-2 font-poppins text-4xl font-normal leading-none text-gray-900 sm:text-6xl">{p.name}</h1>
            {p.description && <p className="mt-5 hidden text-gray-600 md:block">{p.description}</p>}
            <p className="mt-4 font-semibold text-gray-900">
              {naira(p.price)}
              {sale > 0 && <span className="ml-2 font-normal text-gray-400 line-through">{naira(p.oldPrice)}</span>}
            </p>
            <Link to={`/product/${p._id}`} className="mt-6 inline-block bg-gray-900 px-7 py-3 text-sm font-medium text-white hover:bg-black">
              View details
            </Link>
          </div>
          <Link to={`/product/${p._id}`} className="order-first block md:order-none">
            <img src={p.image} alt={p.name} className="mx-auto aspect-square w-full max-w-md object-cover mix-blend-multiply" />
          </Link>
        </div>
        {n > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 md:absolute md:bottom-6 md:right-6 md:mt-0">
            <button type="button" aria-label="Previous" onClick={() => setAt((at - 1 + n) % n)} className="flex h-10 w-10 items-center justify-center border border-gray-300 bg-white hover:border-gray-900">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-500">
              {at + 1} / {n}
            </span>
            <button type="button" aria-label="Next" onClick={() => setAt((at + 1) % n)} className="flex h-10 w-10 items-center justify-center border border-gray-300 bg-white hover:border-gray-900">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function CollectionSlider({ items }) {
  const row = useRef(null)
  const move = (dir) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <div>
      <div ref={row} className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 lg:gap-8">
        {items.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`} className="group w-[78%] shrink-0 snap-start text-center sm:w-[46%] lg:w-[31%]">
            <div className="aspect-[4/5] overflow-hidden bg-gray-50">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <h3 className="mt-4 font-poppins text-lg text-gray-900">{p.name}</h3>
            <p className="mt-1 text-gray-700">
              {off(p) > 0 && <span className="mr-2 font-semibold text-gray-400 line-through">{naira(p.oldPrice)}</span>}
              {naira(p.price)}
            </p>
          </Link>
        ))}
      </div>
      {items.length > 3 && (
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" aria-label="Previous" onClick={() => move(-1)} className="flex h-10 w-10 items-center justify-center border border-gray-300 hover:border-gray-900">
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next" onClick={() => move(1)} className="flex h-10 w-10 items-center justify-center border border-gray-300 hover:border-gray-900">
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default FurnishHome
