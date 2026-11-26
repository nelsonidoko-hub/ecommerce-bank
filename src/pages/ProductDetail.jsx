import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProductById, getProductsByCategory } from '../services/productService'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { useSettings } from '../hooks/useSettings'
import { useStoreTheme } from '../hooks/useStoreTheme'

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
  const { settings } = useSettings()
  const { layout, words } = useStoreTheme()

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

  const style = layout.product || 'classic'

  const breadcrumb = (
    <div className="text-sm text-gray-500 mb-6">
      <Link to="/" className="hover:underline cursor-pointer">Home</Link>
      {' / '}
      <Link to={`/category/${product.category}`} className="capitalize hover:underline">{product.category}</Link>
      {' / '}
      <span>{product.name}</span>
    </div>
  )

  const thumbs = galleryImages.length > 1 && (
    <div className="flex gap-3 mt-3 overflow-x-auto scrollbar-none">
      {galleryImages.map((url, index) => (
        <button
          key={url}
          type="button"
          onClick={() => setActiveImage(url)}
          className={
            activeImage === url
              ? 'w-20 h-20 shrink-0 rounded-md overflow-hidden border-2 border-gray-900'
              : 'w-20 h-20 shrink-0 rounded-md overflow-hidden border border-gray-200 hover:border-gray-400'
          }
        >
          <img src={url} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  )

  const title = (
    <>
      <p className="text-xs uppercase text-gray-400 tracking-wide">{settings.storeName}</p>
      <h2 className="text-2xl font-bold mt-1">{product.name}</h2>
      <p className="text-2xl font-bold text-gray-900 mt-3">
        ₦{product.price.toLocaleString()}
        {product.onSale && product.oldPrice > product.price && (
          <span className="ml-3 text-lg font-normal text-gray-400 line-through">₦{product.oldPrice.toLocaleString()}</span>
        )}
      </p>
    </>
  )
  const description = product.description && <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-line">{product.description}</p>

  const buyBox = (
    <>
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
                  ? 'min-w-11 h-11 px-2 flex items-center justify-center text-sm border border-gray-200 text-gray-300 rounded-md line-through cursor-not-allowed'
                  : selectedSize === s.size
                  ? 'min-w-11 h-11 px-2 flex items-center justify-center text-sm border-2 border-gray-900 bg-gray-900 text-white rounded-md cursor-pointer'
                  : 'min-w-11 h-11 px-2 flex items-center justify-center text-sm border border-gray-300 text-gray-700 rounded-md hover:border-gray-900 cursor-pointer'
              }
            >
              {s.size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <div className="flex items-center border">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-11 hover:bg-gray-100">
            −
          </button>
          <span className="w-10 text-center">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-11 hover:bg-gray-100">
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || !selectedSize}
          className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isOutOfStock ? 'Out of Stock' : words?.add || 'Add to Cart'}
        </button>
      </div>

      <button
        onClick={handleBuyNow}
        disabled={isOutOfStock || !selectedSize}
        className="w-full mt-3 bg-gray-900 text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {words?.buy || 'Buy It Now'}
      </button>
    </>
  )

  const related = relatedProducts.length > 0 && (
    <div className="mt-20">
      <h3 className="text-xl font-bold mb-1">You May Also Like</h3>
      <p className="text-gray-500 mb-6">Combine your style with these products</p>
      <div className="grid grid-cols-1 min-[321px]:grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 font-epilogue">
        {relatedProducts.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  )

  const page = 'px-6 pt-23 pb-12 md:px-10 sm:pt-28 mx-auto'

  // Wide: the photos across the top, then the words and the buy box side by side
  if (style === 'wide') {
    return (
      <div className={`${page} max-w-7xl`}>
        {breadcrumb}
        <div className="scrollbar-none -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
          {galleryImages.slice(0, 4).map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`${product.name} view ${i + 1}`}
              className={`aspect-[4/5] w-[85%] shrink-0 snap-start rounded-lg object-cover md:aspect-[4/3] md:w-full ${galleryImages.length === 1 ? 'md:col-span-2 md:aspect-[16/7]' : ''} ${i >= 2 ? 'md:hidden' : ''}`}
            />
          ))}
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            {title}
            {description}
          </div>
          <div className="md:border-l md:border-gray-200 md:pl-10">{buyBox}</div>
        </div>
        {related}
      </div>
    )
  }

  // Sticky: every photo large, one under the other; the buy box stays in view
  if (style === 'sticky') {
    return (
      <div className={`${page} max-w-7xl`}>
        {breadcrumb}
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="hidden space-y-4 md:block">
              {galleryImages.map((url, i) => (
                <img key={url} src={url} alt={`${product.name} view ${i + 1}`} className="w-full rounded-lg object-cover" />
              ))}
            </div>
            <div className="md:hidden">
              <img src={activeImage} alt={product.name} className="w-full aspect-square object-cover rounded-lg" />
              {thumbs}
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="md:sticky md:top-32">
              {title}
              {buyBox}
              {description && <div className="mt-8 border-t border-gray-200 pt-6">{description}</div>}
            </div>
          </div>
        </div>
        {related}
      </div>
    )
  }

  // Simple: one column, centred (food, menus, small shops)
  if (style === 'simple') {
    return (
      <div className={`${page} max-w-xl`}>
        {breadcrumb}
        <img src={activeImage} alt={product.name} className="w-full aspect-[4/3] object-cover rounded-lg" />
        {thumbs}
        <div className="mt-6 text-center">{title}</div>
        {description}
        {buyBox}
        {related}
      </div>
    )
  }

  // Classic: photo left, details right
  return (
    <div className={`${page} max-w-6xl`}>
      {breadcrumb}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <img src={activeImage} alt={product.name} className="w-full h-100 md:h-[500px] object-cover rounded-lg" />
          {thumbs}
        </div>
        <div>
          {title}
          {description}
          {buyBox}
        </div>
      </div>
      {related}
    </div>
  )
}

export default ProductDetail