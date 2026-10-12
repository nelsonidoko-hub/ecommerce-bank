import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/productService'

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  function getFilteredProducts() {
    let result = [...products]

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      result = result.filter((p) => p.price >= min && (max ? p.price <= max : true))
    }

    if (inStockOnly) {
      result = result.filter((p) => p.sizes.some((s) => s.stock > 0))
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return result
  }

  const filteredProducts = getFilteredProducts()

  return (
    <div className="px-6 md:px-10 py-8">
      <h2 className="text-2xl font-bold mb-6">Shop All</h2>

      <div className="flex flex-wrap gap-4 mb-8 pb-4 border-b">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Prices</option>
          <option value="0-5000">Under ₦5,000</option>
          <option value="5000-15000">₦5,000 - ₦15,000</option>
          <option value="15000-50000">₦15,000 - ₦50,000</option>
          <option value="50000-">Above ₦50,000</option>
        </select>

        <label className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          In Stock Only
        </label>

        <span className="text-sm text-gray-500 flex items-center ml-auto">
          {filteredProducts.length} products
        </span>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 min-[321px]:grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 gap-6 font-epilogue">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Shop