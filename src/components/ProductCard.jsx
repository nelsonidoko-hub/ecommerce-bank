import { Link } from 'react-router-dom'
import { useState, useContext } from 'react'
import { useCart } from '../context/CartContext'
import { useStoreTheme } from '../hooks/useStoreTheme'
import { ListLayoutContext } from '../context/ListLayoutContext'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.find((s) => s.stock > 0)?.size || ''
  )
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()
  const { layout } = useStoreTheme()
  const inList = useContext(ListLayoutContext)

  const isOutOfStock = product.sizes.every((s) => s.stock === 0)

  // The look comes from the template. Menu rows only appear inside a ProductGrid
  // that is showing a list, so carousels and other pages keep the normal card.
  const variant = layout.card === 'menu' ? (inList ? 'menu' : 'standard') : layout.card

  function handleAdd(e) {
    e.preventDefault()
    if (!isOutOfStock && selectedSize) addToCart(product, selectedSize)
  }

  const onSale = product.onSale && product.oldPrice
  const price = onSale ? (
    <>
      <span className="line-through text-gray-400 mr-2">₦{product.oldPrice.toLocaleString()}</span>
      <span>₦{product.price.toLocaleString()}</span>
    </>
  ) : (
    <>₦{product.price.toLocaleString()}</>
  )

  /* ---------- menu row: photo on the left, details in the middle, Add on the right ---------- */
  if (variant === 'menu') {
    return (
      <Link
        to={`/product/${product._id}`}
        className="group flex items-center gap-4 border-b border-gray-200 py-4"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100 sm:h-28 sm:w-28">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">{product.name}</h3>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{product.description}</p>
          )}
          <p className="mt-1 font-semibold text-gray-900">{price}</p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || !selectedSize}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isOutOfStock ? 'Sold out' : 'Add'}
        </button>
      </Link>
    )
  }

  /* ---------- card: standard (the original), borderless or bordered ---------- */
  const wrapperClass = {
    standard: 'rounded-lg p-1.5 sm:p-4 transition-all duration-300 hover:-translate-y-1',
    borderless: 'transition-opacity duration-300',
    bordered:
      'border-2 border-gray-900 p-2 sm:p-3 transition-shadow duration-200 hover:shadow-[5px_5px_0_0_#000]',
  }[variant] || ''

  return (
    <div
      className={wrapperClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative w-full aspect-[3/4] mb-3 overflow-hidden rounded-md">
          {isOutOfStock ? (
            <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10">
              Out of Stock
            </span>
          ) : product.onSale ? (
            <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10">
              Sale
            </span>
          ) : null}
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition duration-300 ${
              isHovered && product.hoverImage ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {product.hoverImage && (
            <img
              src={product.hoverImage}
              alt={`${product.name} back view`}
              className={`absolute inset-0 w-full h-full object-cover transition duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>

        {variant !== 'borderless' && (
          <span className="text uppercase text-gray-500">{product.category}</span>
        )}
        <h3 className={variant === 'borderless' ? 'text-sm' : 'text mt-1'}>{product.name}</h3>
        <div className="text text-black mt-1 flex items-center justify-between">
          <p>{price}</p>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="w-8 h-8 flex items-center justify-center transparent text-black rounded-md hover:bg-white hover:cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShoppingBagIcon className="w-5 h-5" />
          </button>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard