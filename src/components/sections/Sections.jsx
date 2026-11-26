import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import ProductCard from '../ProductCard'
import ProductGrid from '../ProductGrid'
import FeaturedCollection from '../FeaturedCollection'
import { placeholderPicture } from '../../utils/placeholderPicture'
import { isExternal } from '../../utils/sections'
import { useStoreTheme } from '../../hooks/useStoreTheme'

// One component per homepage section type. They only read their own `data`
// (checked on the server) and the products Home loaded for them. All text is
// rendered as text by React, never as HTML.

const buttonClass = 'inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700'

// A button that goes to a page of the shop, or opens another site in a new tab
export function SectionButton({ label, link, className = buttonClass }) {
  if (!label || !link) return null
  const content = (
    <>
      {label}
      <ArrowRightIcon className="h-5 w-5" />
    </>
  )
  return isExternal(link) ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link to={link} className={className}>
      {content}
    </Link>
  )
}

// A sideways-scrolling row of product cards, with arrows and a progress line
function ProductCarousel({ products }) {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)
  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const total = el.scrollWidth - el.clientWidth
    if (total > 0) setProgress((el.scrollLeft / total) * 100)
  }
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.75), behavior: 'smooth' })

  return (
    <div className="relative mt-6">
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-2 top-1/3 z-10 hidden rounded-full bg-white/80 p-2 text-gray-800 shadow-md transition-all hover:bg-white md:block"
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="h-8 w-8" />
      </button>
      <div ref={ref} onScroll={onScroll} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 font-epilogue md:gap-6">
        {products.map((product) => (
          // Two per screen on phones, three on tablets, four on laptops, however
          // wide the card's own picture is
          <div key={product._id} className="w-[46%] min-w-0 flex-shrink-0 snap-start sm:w-[31%] lg:w-[23%]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-2 top-1/3 z-10 hidden rounded-full bg-white/80 p-2 text-gray-800 shadow-md transition-all hover:bg-white md:block"
        aria-label="Scroll right"
      >
        <ChevronRightIcon className="h-8 w-8" />
      </button>
      <div className="m-auto mt-1 h-0.5 w-40 overflow-hidden rounded-full bg-gray-300">
        <div className="h-full rounded-full bg-gray-900 transition-all duration-150" style={{ width: `${Math.max(progress, 10)}%` }} />
      </div>
    </div>
  )
}

const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

// Spotlight row: the first product big, the next four beside it
function SpotlightRow({ products }) {
  const [star, ...rest] = products
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
      <Link to={`/product/${star._id}`} className="group relative block aspect-square overflow-hidden rounded-lg bg-gray-100 md:aspect-auto md:min-h-[28rem]">
        <img src={star.image} alt={star.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
          <p className="font-poppins text-xl font-semibold">{star.name}</p>
          <p className="mt-1">{naira(star.price)}</p>
        </div>
      </Link>
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3 font-epilogue md:gap-6">
          {rest.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

// Shelf row (supermarkets): small photo beside the name and price, many per screen
function ShelfRow({ products }) {
  return (
    <div className="mt-6 grid gap-3 font-epilogue sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <Link key={p._id} to={`/product/${p._id}`} className="group flex items-center gap-3 rounded-md border border-gray-200 bg-white p-2 hover:shadow-md">
          <img src={p.image} alt={p.name} className="h-20 w-20 shrink-0 rounded-md bg-gray-100 object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm text-gray-900">{p.name}</p>
            <p className="mt-1 font-semibold text-gray-900">
              {naira(p.price)}
              {p.onSale && p.oldPrice > p.price && <span className="ml-2 text-xs font-normal text-gray-400 line-through">{naira(p.oldPrice)}</span>}
            </p>
            <span className="mt-1 inline-block text-xs font-medium text-blue-600 group-hover:underline">View</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function ProductsSection({ data, products }) {
  const { layout } = useStoreTheme()
  const list = products.slice(0, Number(data.count) || 8)
  // The merchant's "Sliding row" always slides; other rows take the template's style
  const style = data.layout === 'carousel' ? 'slider' : layout.rows || 'grid'
  const centred = style === 'slider'
  return (
    <section className="mb-16 mt-12 px-6 md:px-10">
      {data.subtitle && centred && <p className="mb-2 text-center font-poppins text-gray-500">{data.subtitle}</p>}
      {data.title && <h2 className={`mb-2 font-poppins text-2xl ${centred ? 'text-center uppercase' : ''}`}>{data.title}</h2>}
      {data.subtitle && !centred && <p className="mb-4 font-epilogue text-gray-500">{data.subtitle}</p>}
      {list.length === 0 ? (
        <p className="text-gray-500">No products here yet.</p>
      ) : style === 'slider' ? (
        <ProductCarousel products={list} />
      ) : style === 'spotlight' ? (
        <SpotlightRow products={list} />
      ) : style === 'shelf' ? (
        <ShelfRow products={list} />
      ) : (
        <ProductGrid products={list} />
      )}
    </section>
  )
}

export function BannerSection({ data }) {
  return (
    <section className="mb-16 px-6 md:px-10">
      <div
        className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-900 bg-cover bg-center text-center font-poppins text-white md:h-80"
        style={{ backgroundImage: `url("${data.image || placeholderPicture('', { from: '#64748b', to: '#1e293b' })}")` }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 px-6">
          {data.heading && <h3 className="mb-2 text-3xl font-bold">{data.heading}</h3>}
          {data.text && <p className="mb-4">{data.text}</p>}
          <SectionButton label={data.buttonLabel} link={data.buttonLink} />
        </div>
      </div>
    </section>
  )
}

export function FeaturedSection({ data, products, storeName }) {
  return (
    <FeaturedCollection
      products={products.slice(0, 4)}
      image={data.image || placeholderPicture(storeName, { from: '#94a3b8', to: '#334155', width: 900, height: 1100 })}
      title={data.title}
      buttonText={data.buttonLabel}
      buttonLink={data.buttonLink || '/shop'}
    />
  )
}

export function TextSection({ data }) {
  const left = data.align === 'left'
  return (
    <section className={`mx-auto mb-16 max-w-3xl px-6 ${left ? 'text-left' : 'text-center'}`}>
      {data.heading && <h2 className="mb-4 font-poppins text-2xl font-semibold">{data.heading}</h2>}
      {data.text && <p className="whitespace-pre-line font-epilogue text-lg leading-relaxed text-gray-600">{data.text}</p>}
    </section>
  )
}

export function ImageTextSection({ data, storeName }) {
  const image = data.image || placeholderPicture(storeName, { from: '#cbd5e1', to: '#64748b', width: 900, height: 700 })
  return (
    <section className="mb-16 px-6 md:px-10">
      <div className={`flex flex-col items-center gap-8 md:flex-row ${data.imageSide === 'right' ? 'md:flex-row-reverse' : ''}`}>
        <img src={image} alt="" className="aspect-[4/3] w-full rounded-lg object-cover md:w-1/2" />
        <div className="md:w-1/2">
          {data.heading && <h2 className="mb-3 font-poppins text-2xl font-semibold">{data.heading}</h2>}
          {data.text && <p className="mb-6 whitespace-pre-line font-epilogue text-gray-600">{data.text}</p>}
          <SectionButton label={data.buttonLabel} link={data.buttonLink} />
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection({ data }) {
  const { layout } = useStoreTheme()
  const items = (data.items || []).filter((i) => i.quote)
  if (items.length === 0) return null
  if (layout.quotes === 'single') return <SingleQuote title={data.title} items={items} />
  if (layout.quotes === 'plain') {
    return (
      <section className="mx-auto mb-16 max-w-5xl px-6 md:px-10">
        {data.title && <h2 className="mb-8 font-poppins text-2xl font-semibold">{data.title}</h2>}
        <div className="grid gap-8 md:grid-cols-2">
          {items.map((item, i) => (
            <figure key={i} className="border-l-2 border-gray-900 pl-5">
              <blockquote className="font-epilogue text-lg italic text-gray-700">“{item.quote}”</blockquote>
              {item.name && <figcaption className="mt-3 text-sm uppercase tracking-wider text-gray-500">{item.name}</figcaption>}
            </figure>
          ))}
        </div>
      </section>
    )
  }
  return (
    <section className="mb-16 bg-gray-50 px-6 py-14 md:px-10">
      {data.title && <h2 className="mb-8 text-center font-poppins text-2xl font-semibold">{data.title}</h2>}
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {items.map((item, i) => (
          <figure key={i} className="rounded-lg bg-white p-6 shadow-sm">
            <blockquote className="font-epilogue text-gray-700">“{item.quote}”</blockquote>
            {item.name && <figcaption className="mt-4 text-sm font-semibold text-gray-900">{item.name}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  )
}

// One big review at a time, with dots to move between them
function SingleQuote({ title, items }) {
  const [at, setAt] = useState(0)
  const item = items[Math.min(at, items.length - 1)]
  return (
    <section className="mx-auto mb-16 max-w-3xl px-6 text-center">
      {title && <h2 className="mb-6 font-poppins text-sm font-semibold uppercase tracking-widest text-gray-500">{title}</h2>}
      <blockquote className="font-poppins text-2xl leading-snug text-gray-900 sm:text-3xl">“{item.quote}”</blockquote>
      {item.name && <p className="mt-5 font-epilogue text-gray-500">— {item.name}</p>}
      {items.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAt(i)}
              aria-label={`Review ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${i === at ? 'bg-gray-900' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// "Shop by category", in the template's style. Each category shows the newest
// product picture in it.
export function CategoryStrip({ style, categories, products }) {
  const items = categories
    .filter((c) => !c.parent)
    .map((c) => ({ ...c, image: products.find((p) => p.category === c.name)?.image }))
  if (!items.length || style === 'none') return null

  if (style === 'chips') {
    return (
      <section className="mb-10 px-6 md:px-10">
        <div className="scrollbar-none flex gap-2 overflow-x-auto py-1">
          <Link to="/shop" className="shrink-0 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white">All</Link>
          {items.map((c) => (
            <Link key={c._id || c.name} to={`/category/${c.name}`} className="shrink-0 whitespace-nowrap rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:border-gray-900">
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  const pictured = items.filter((c) => c.image)
  if (!pictured.length) return null

  if (style === 'circles') {
    return (
      <section className="mb-12 px-6 md:px-10">
        <h2 className="mb-5 font-poppins text-xl font-semibold">Shop by category</h2>
        <div className="scrollbar-none flex gap-5 overflow-x-auto pb-1 sm:gap-8">
          {pictured.map((c) => (
            <Link key={c._id || c.name} to={`/category/${c.name}`} className="group w-20 shrink-0 text-center sm:w-24">
              <span className="block aspect-square overflow-hidden rounded-full bg-gray-100 ring-2 ring-transparent transition group-hover:ring-blue-600">
                <img src={c.image} alt="" className="h-full w-full object-cover" />
              </span>
              <span className="mt-2 block truncate text-sm text-gray-800">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (style === 'banners') {
    return (
      <section className="mb-12 grid gap-4 px-6 sm:grid-cols-2 md:px-10">
        {pictured.slice(0, 4).map((c) => (
          <Link key={c._id || c.name} to={`/category/${c.name}`} className="group relative block aspect-[2/1] overflow-hidden rounded-lg bg-gray-100">
            <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <span className="absolute bottom-0 left-0 p-5 text-white">
              <span className="block font-poppins text-xl font-semibold">{c.label}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm">Shop now <ArrowRightIcon className="h-4 w-4" /></span>
            </span>
          </Link>
        ))}
      </section>
    )
  }

  // tiles: big portrait photos
  const tiles = pictured.slice(0, 4)
  return (
    <section className="mx-auto mb-12 max-w-7xl px-4 sm:px-6">
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

// Same clean-up as the floating WhatsApp button: 0801… / +234… / 234…
export const whatsappDigits = (raw) => {
  let n = String(raw || '').replace(/\D/g, '')
  if (n.startsWith('0')) n = `234${n.slice(1)}`
  return n
}

export function WhatsAppSection({ data, whatsappNumber, isPreview }) {
  const number = whatsappDigits(whatsappNumber)
  if (number.length < 8) {
    // Visitors never see an empty section; the owner sees why it's empty
    return isPreview ? (
      <p className="mx-6 mb-16 rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
        Add your WhatsApp number in Settings to show this section.
      </p>
    ) : null
  }
  return (
    <section className="mx-6 mb-16 rounded-2xl bg-green-50 px-6 py-10 text-center md:mx-10">
      <ChatBubbleLeftRightIcon className="mx-auto h-10 w-10 text-green-600" />
      {data.heading && <h2 className="mt-3 font-poppins text-2xl font-semibold text-gray-900">{data.heading}</h2>}
      {data.text && <p className="mt-2 text-gray-600">{data.text}</p>}
      <a
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
      >
        {data.buttonLabel || 'Chat on WhatsApp'}
      </a>
    </section>
  )
}
