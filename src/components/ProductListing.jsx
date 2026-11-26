import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProductGrid from './ProductGrid'
import ProductCard from './ProductCard'
import StoreSearchBar from './StoreSearchBar'
import { useStoreTheme } from '../hooks/useStoreTheme'
import { getCategories } from '../services/categoryService'

// The Shop and category pages. The filters are the same everywhere; the
// template decides how the page is laid out (layout.listing):
//   standard  filters in a row above the products
//   sidebar   filters and categories in a column on the left (big shops)
//   chips     tappable price chips and category chips (phones, food)
//   large     two big photos per row and a quiet filter line (fashion)

export const PRICE_RANGES = [
  ['all', 'All prices'],
  ['0-5000', 'Under ₦5,000'],
  ['5000-15000', '₦5,000 - ₦15,000'],
  ['15000-50000', '₦15,000 - ₦50,000'],
  ['50000-', 'Above ₦50,000'],
]
const SORTS = [
  ['newest', 'Newest'],
  ['price-low', 'Price: Low to High'],
  ['price-high', 'Price: High to Low'],
]

export function filterProducts(products, { sortBy, priceRange, inStockOnly }) {
  let result = [...(products || [])]
  if (priceRange !== 'all') {
    const [min, max] = priceRange.split('-').map(Number)
    result = result.filter((p) => p.price >= min && (max ? p.price <= max : true))
  }
  if (inStockOnly) result = result.filter((p) => (p.sizes || []).some((s) => s.stock > 0))
  if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price)
  else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return result
}

const selectClass = 'border rounded-md px-3 py-2 text-sm'

function SortSelect({ value, onChange, className = selectClass }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className} aria-label="Sort by">
      {SORTS.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  )
}

function StockToggle({ checked, onChange, className = 'flex items-center gap-2 text-sm border rounded-md px-3 py-2 cursor-pointer' }) {
  return (
    <label className={className}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      In stock only
    </label>
  )
}

function ProductListing({ title, products, loading, current = '', emptyText = 'No products found.' }) {
  const { layout } = useStoreTheme()
  const style = layout.listing || 'standard'
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (style !== 'sidebar' && style !== 'chips') return
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data.filter((c) => !c.parent) : []))
      .catch(() => {})
  }, [style])

  const shown = useMemo(() => filterProducts(products, { sortBy, priceRange, inStockOnly }), [products, sortBy, priceRange, inStockOnly])
  const count = <span className="text-sm text-gray-500">{shown.length} products</span>
  const results = loading ? (
    <p>Loading products...</p>
  ) : shown.length === 0 ? (
    <p className="text-gray-500">{emptyText}</p>
  ) : style === 'large' ? (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 font-epilogue sm:grid-cols-2">
      {shown.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  ) : (
    <ProductGrid products={shown} />
  )
  const heading = <h2 className="font-poppins text-2xl font-bold capitalize">{title}</h2>
  const page = 'px-6 pb-12 pt-20 md:px-10 sm:pt-28'

  if (style === 'sidebar') {
    const radio = (name, value, label, checked, onChange) => (
      <label key={value} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700">
        <input type="radio" name={name} checked={checked} onChange={() => onChange(value)} />
        {label}
      </label>
    )
    return (
      <div className={`${page} mx-auto max-w-[90rem]`}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          {heading}
          <div className="flex items-center gap-3">
            {count}
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>
        <StoreSearchBar />
        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
          {/* Phones: categories swipe sideways and the filters fold away */}
          <div className="mb-6 lg:hidden">
            {categories.length > 0 && (
              <div className="scrollbar-none mb-3 flex gap-2 overflow-x-auto py-1">
                <Link to="/shop" className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${!current ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-800'}`}>
                  All products
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c._id || c.name}
                    to={`/category/${c.name}`}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${current === c.name ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-800'}`}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
            <details className="rounded-md border border-gray-200 bg-white px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900">Filter by price and stock</summary>
              <div className="mt-3">
                {PRICE_RANGES.map(([v, label]) => radio('price-phone', v, label, priceRange === v, setPriceRange))}
                <StockToggle checked={inStockOnly} onChange={setInStockOnly} className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-gray-700" />
              </div>
            </details>
          </div>
          <aside className="hidden space-y-6 rounded-md border border-gray-200 bg-white p-4 lg:sticky lg:top-32 lg:block lg:self-start">
            {categories.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Categories</p>
                <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                  <Link to="/shop" className={`text-sm ${!current ? 'font-semibold text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>
                    All products
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c._id || c.name}
                      to={`/category/${c.name}`}
                      className={`text-sm ${current === c.name ? 'font-semibold text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Price</p>
              {PRICE_RANGES.map(([v, label]) => radio('price', v, label, priceRange === v, setPriceRange))}
            </div>
            <StockToggle checked={inStockOnly} onChange={setInStockOnly} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700" />
          </aside>
          <div className="min-w-0">{results}</div>
        </div>
      </div>
    )
  }

  if (style === 'chips') {
    const chip = (active) =>
      `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm ${active ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-800 hover:border-gray-900'}`
    return (
      <div className={page}>
        <div className="mb-4 flex items-center justify-between gap-4">
          {heading}
          {count}
        </div>
        <StoreSearchBar />
        {categories.length > 0 && (
          <div className="scrollbar-none mb-3 flex gap-2 overflow-x-auto py-1">
            <Link to="/shop" className={chip(!current)}>
              All
            </Link>
            {categories.map((c) => (
              <Link key={c._id || c.name} to={`/category/${c.name}`} className={chip(current === c.name)}>
                {c.label}
              </Link>
            ))}
          </div>
        )}
        <div className="scrollbar-none mb-8 flex items-center gap-2 overflow-x-auto border-b pb-4">
          {PRICE_RANGES.map(([v, label]) => (
            <button key={v} type="button" onClick={() => setPriceRange(v)} className={chip(priceRange === v)}>
              {label}
            </button>
          ))}
          <button type="button" onClick={() => setInStockOnly((x) => !x)} className={chip(inStockOnly)}>
            In stock
          </button>
          <SortSelect value={sortBy} onChange={setSortBy} className="shrink-0 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm" />
        </div>
        {results}
      </div>
    )
  }

  if (style === 'large') {
    const quiet = 'bg-transparent text-sm text-gray-700 underline-offset-4 hover:underline focus:outline-none'
    return (
      <div className={`${page} mx-auto max-w-6xl`}>
        <div className="mb-8 text-center">
          {heading}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-y border-gray-200 py-3">
            <SortSelect value={sortBy} onChange={setSortBy} className={quiet} />
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className={quiet} aria-label="Price">
              {PRICE_RANGES.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
            <StockToggle checked={inStockOnly} onChange={setInStockOnly} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700" />
            {count}
          </div>
        </div>
        {results}
      </div>
    )
  }

  // standard
  return (
    <div className={page}>
      <div className="mb-6">{heading}</div>
      <StoreSearchBar />
      <div className="mb-8 flex flex-wrap gap-4 border-b pb-4">
        <SortSelect value={sortBy} onChange={setSortBy} />
        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className={selectClass} aria-label="Price">
          {PRICE_RANGES.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <StockToggle checked={inStockOnly} onChange={setInStockOnly} />
        <span className="ml-auto flex items-center">{count}</span>
      </div>
      {results}
    </div>
  )
}

export default ProductListing
