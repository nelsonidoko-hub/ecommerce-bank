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

  // Small corner label used by the newer card styles
  const badge = isOutOfStock ? 'Sold out' : onSale ? 'Sale' : ''
  const addLabel = isOutOfStock ? 'Sold out' : 'Add to cart'

  /* ---------- compact (Catalog): dense, square photo, price first ---------- */
  if (variant === 'compact') {
    return (
      <Link to={`/product/${product._id}`} className="group flex flex-col rounded-md border border-gray-200 bg-white p-2 transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
          {badge && (
            <span className="absolute left-1.5 top-1.5 z-10 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {badge}
            </span>
          )}
          <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <p className="mt-2 text-base font-bold text-gray-900">{price}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-gray-700">{product.name}</h3>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || !selectedSize}
          className="mt-2 w-full rounded-md bg-blue-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isOutOfStock ? 'Sold out' : 'Add'}
        </button>
      </Link>
    )
  }

  /* ---------- centered (Glow): soft rounded photo, centred text ---------- */
  if (variant === 'centered') {
    return (
      <Link to={`/product/${product._id}`} className="group flex flex-col items-center text-center">
        <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-blue-50">
          {badge && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900">
              {badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className="font-poppins text-base text-gray-900">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{price}</p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || !selectedSize}
          className="mt-3 rounded-full border border-blue-600 px-5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isOutOfStock ? 'Sold out' : 'Add to bag'}
        </button>
      </Link>
    )
  }

  /* ---------- spec (Tech): whole product on white, full-width button ---------- */
  if (variant === 'spec') {
    return (
      <Link to={`/product/${product._id}`} className="group flex flex-col rounded-lg border border-gray-200 bg-[#ffffff] p-3 transition-shadow hover:shadow-lg">
        <div className="relative aspect-square">
          {badge && (
            <span className="absolute left-0 top-0 z-10 rounded bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
              {badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
          />
        </div>
        {product.category && (
          <span className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-600">{product.category}</span>
        )}
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-gray-900">{product.name}</h3>
        <p className="mt-2 text-lg font-bold text-gray-900">{price}</p>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || !selectedSize}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          {addLabel}
        </button>
      </Link>
    )
  }

  /* ---------- tile (Playful): tinted chunky card, round add button ---------- */
  if (variant === 'tile') {
    return (
      <Link to={`/product/${product._id}`} className="group flex flex-col rounded-3xl bg-blue-50 p-3 transition-transform duration-300 hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#ffffff]">
          {badge && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-3 line-clamp-2 font-bold leading-snug text-gray-900">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full bg-[#ffffff] px-3 py-1 text-sm font-bold text-gray-900">{price}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || !selectedSize}
            aria-label={isOutOfStock ? 'Sold out' : `Add ${product.name} to cart`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
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