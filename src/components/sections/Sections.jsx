import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import ProductCard from '../ProductCard'
import ProductGrid from '../ProductGrid'
import FeaturedCollection from '../FeaturedCollection'
import { placeholderPicture } from '../../utils/placeholderPicture'
import { isExternal } from '../../utils/sections'

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
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  return (
    <div className="relative mt-6">
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-2 top-40 z-10 hidden rounded-full bg-white/80 p-2 text-gray-800 shadow-md transition-all hover:bg-white md:block"
        aria-label="Scroll left"
      >
        <ChevronLeftIcon className="h-8 w-8" />
      </button>
      <div ref={ref} onScroll={onScroll} className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2">
        {products.map((product) => (
          <div key={product._id} className="min-w-[250px] flex-shrink-0 snap-start md:min-w-[300px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-2 top-40 z-10 hidden rounded-full bg-white/80 p-2 text-gray-800 shadow-md transition-all hover:bg-white md:block"
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

export function ProductsSection({ data, products }) {
  const list = products.slice(0, Number(data.count) || 8)
  return (
    <section className="mb-16 mt-12 px-6 md:px-10">
      {data.subtitle && data.layout === 'carousel' && <p className="mb-2 text-center font-poppins text-gray-500">{data.subtitle}</p>}
      {data.title && (
        <h2 className={`mb-2 font-poppins text-2xl ${data.layout === 'carousel' ? 'text-center uppercase' : ''}`}>{data.title}</h2>
      )}
      {data.subtitle && data.layout !== 'carousel' && <p className="mb-4 font-epilogue text-gray-500">{data.subtitle}</p>}
      {list.length === 0 ? (
        <p className="text-gray-500">No products here yet.</p>
      ) : data.layout === 'carousel' ? (
        <ProductCarousel products={list} />
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
  const items = (data.items || []).filter((i) => i.quote)
  if (items.length === 0) return null
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
