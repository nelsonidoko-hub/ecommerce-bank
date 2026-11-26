import { useState, useEffect } from 'react'
import ProductListing from '../components/ProductListing'
import { getProducts } from '../services/productService'

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }, [])

  return <ProductListing title="Shop All" products={products} loading={loading} />
}

export default Shop
