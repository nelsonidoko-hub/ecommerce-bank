import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.find((s) => s.stock > 0)?.size || ''
  )
  const [isHovered, setIsHovered] = useState(false)
  const { addToCart } = useCart()

  const isOutOfStock = product.sizes.every((s) => s.stock === 0)

  return (
    <div
      className="rounded-lg p-1.5 sm:p-4 transition-all duration-300 hover:-translate-y-1"
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
        <span className="text uppercase text-gray-500">{product.category}</span>
        <h3 className="text mt-1">{product.name}</h3>
        <div className="text text-black mt-1 flex items-center justify-between">
          <p>
            {product.onSale && product.oldPrice ? (
              <>
                <span className="line-through text-gray-400 mr-2">₦{product.oldPrice}</span>
                <span className="text-black-400">₦{product.price}</span>
              </>
            ) : (
              <>₦{product.price}</>
            )}
          </p>
          <button
            onClick={(e) => {
              e.preventDefault()
              if (!isOutOfStock && selectedSize) addToCart(product, selectedSize)
            }}
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