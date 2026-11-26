import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProductListing from '../components/ProductListing'
import { getProductsByCategory } from '../services/productService'

function CategoryPage() {
  const { categoryName } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getProductsByCategory(categoryName)
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }, [categoryName])

  return (
    <ProductListing
      title={categoryName}
      products={products}
      loading={loading}
      current={categoryName}
      emptyText="No products found matching your filters."
    />
  )
}

export default CategoryPage
