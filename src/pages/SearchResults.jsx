import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { searchProducts } from '../services/productService'

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setInput(query)

    if (!query) {
      setProducts([])
      setLoading(false)
      return
    }

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await searchProducts(query)
        if (!cancelled) setProducts(data)
      } catch (err) {
        if (!cancelled) setError('Search failed. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [query])

  function handleSubmit(e) {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  return (
    <div className="px-6 md:px-10 pt-28 pb-8">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 text-gray-900"
        />
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md">
          Search
        </button>
      </form>

      {query && (
        <h2 className="text-xl mb-6">
          Results for <span className="font-bold">"{query}"</span>
        </h2>
      )}

      {loading ? (
        <p>Searching...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">{query ? 'No products found.' : 'Type something to search.'}</p>
      ) : (
        <div className="grid grid-cols-1 min-[321px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchResults