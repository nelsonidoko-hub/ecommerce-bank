import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProductById, getProductsByCategory } from '../services/productService'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState('')
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId)
        setProduct(data)
        setActiveImage(data.image)

        const related = await getProductsByCategory(data.category)
        setRelatedProducts(related.filter((p) => p._id !== data._id).slice(0, 4))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
    setQuantity(1)
  }, [productId])

  useEffect(() => {
    if (product?.sizes?.length) {
      const firstAvailable = product.sizes.find((s) => s.stock > 0)
      setSelectedSize(firstAvailable ? firstAvailable.size : '')
    }
  }, [product])

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize)
    }
  }

  function handleBuyNow() {
    handleAddToCart()
    navigate('/checkout')
  }

  if (loading) {
    return <p className="px-6 md:px-10 py-12">Loading...</p>
  }

  if (!product) {
    return <p className="px-6 md:px-10 py-12">Product not found.</p>
  }

  const isOutOfStock = product.sizes.every((s) => s.stock === 0)

  // Build the gallery from the main image, the hover/back-view image, and
  // any extra gallery shots — deduped and with empty values filtered out.
  const galleryImages = [product.image, product.hoverImage, ...(product.images || [])].filter(
    (url, index, arr) => Boolean(url) && arr.indexOf(url) === index
  )

  return (
    <div className="px-6 pt-23 md:px-10 pt-19 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:underline cursor-pointer">Home</Link>
        {' / '}
        <span className="capitalize cursor-pointer">{product.category}</span>
        {' / '}
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div>
          <img
            src={activeImage}
            alt={product.name}
            className="w-full h-100 md:h-[500px] object-cover rounded-lg"
          />

          {galleryImages.length > 1 && (
            <div className="flex gap-3 mt-3">
              {galleryImages.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={
                    activeImage === url
                      ? 'w-20 h-20 rounded-md overflow-hidden border-2 border-gray-900'
                      : 'w-20 h-20 rounded-md overflow-hidden border border-gray-200 hover:border-gray-400'
                  }
                >
                  <img
                    src={url}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase text-gray-400 tracking-wide">Zipp Republic</p>
          <h2 className="text-2xl font-bold mt-1">{product.name}</h2>
          <p className="text-2xl font-bold text-gray-900 mt-3">₦{product.price.toLocaleString()}</p>

          <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          {/* Size */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Size: {selectedSize}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.size}
                  disabled={s.stock === 0}
                  onClick={() => setSelectedSize(s.size)}
                  className={
                    s.stock === 0
                      ? 'w-11 h-11 flex items-center justify-center text-sm border border-gray-200 text-gray-300 rounded-md line-through cursor-not-allowed'
                      : selectedSize === s.size
                      ? 'w-11 h-11 flex items-center justify-center text-sm border-2 border-gray-900 bg-gray-900 text-white rounded-md cursor-pointer'
                      : 'w-11 h-11 flex items-center justify-center text-sm border border-gray-300 text-gray-700 rounded-md hover:border-gray-900 cursor-pointer'
                  }
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-11 hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-11 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !selectedSize}
              className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock || !selectedSize}
            className="w-full mt-3 bg-gray-900 text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Buy It Now
          </button>
        </div>
      </div>

      {/* You may also like */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h3 className="text-xl font-bold mb-1">You May Also Like</h3>
          <p className="text-gray-500 mb-6">Combine your style with these products</p>
          <div className="grid grid-cols-1 min-[321px]:grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4 gap-6 font-epilogue">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail