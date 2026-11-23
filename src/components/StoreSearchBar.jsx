import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useStoreTheme } from '../hooks/useStoreTheme'

// A big search box above the products. Only templates with `layout.search`
// (Catalog and Tech) show it; everywhere else it renders nothing, and the
// navbar's search icon still works as before.
function StoreSearchBar({ initial = '' }) {
  const { layout } = useStoreTheme()
  const [query, setQuery] = useState(initial)
  const navigate = useNavigate()

  if (!layout.search) return null

  function handleSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="mb-6 flex w-full gap-2">
      <label htmlFor="store-search" className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          id="store-search"
          type="search"
          value={query}
          maxLength={100}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands and categories"
          className="w-full rounded-md border border-gray-300 bg-[#ffffff] py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  )
}

export default StoreSearchBar
