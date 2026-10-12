import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { getProductsByCategory } from '../services/productService'
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, isCartOpen, closeCart } =
    useCart()

  const [relatedProducts, setRelatedProducts] = useState([])

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  useEffect(() => {
    if (!isCartOpen || cartItems.length === 0) {
      return
    }

    let isCancelled = false

    async function fetchRelated() {
      try {
        const category = cartItems[0].category
        if (!category) return

        const products = await getProductsByCategory(category)
        const inCartIds = new Set(cartItems.map((item) => item._id))

        if (!isCancelled) {
          setRelatedProducts(
            products.filter((p) => !inCartIds.has(p._id)).slice(0, 6)
          )
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchRelated()

    return () => {
      isCancelled = true
    }
  }, [isCartOpen, cartItems])

  const showSuggestions = cartItems.length > 0 && relatedProducts.length > 0

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel pinned to the Right */}
      <div
        className={`fixed top-0 right-0 h-full max-w-full z-50 shadow-xl bg-white
        transform transition-transform duration-300 ease-in-out flex flex-col lg:flex-row
        ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        ${showSuggestions ? 'lg:max-w-2xl xl:max-w-3xl w-full' : 'max-w-md w-full'}`}
      >
        {/* DESKTOP SUGGESTIONS RAIL (Placed on Left of Cart) */}
        {showSuggestions && (
          <div className="hidden lg:flex flex-col w-56 xl:w-64 border-r bg-gray-50 h-full">
            <div className="p-4 border-b bg-gray-50 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 text-center">
                You May Also Like
              </h3>
            </div>

            {/* Scrollable vertical product list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {relatedProducts.map((product) => (
                <div key={product._id} className="flex flex-col items-center text-center group">
                  <Link
                    to={`/product/${product._id}`}
                    onClick={closeCart}
                    className="w-full aspect-[3/4] mb-2 overflow-hidden bg-gray-200 rounded-sm"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <Link
                    to={`/product/${product._id}`}
                    onClick={closeCart}
                    className="text-xs font-semibold text-gray-900 uppercase tracking-tight line-clamp-1 hover:underline"
                  >
                    {product.name}
                  </Link>

                  <div className="text-xs mt-1 font-medium text-gray-800">
                    {product.onSale && product.oldPrice ? (
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="line-through text-gray-400">
                          ₦{product.oldPrice.toLocaleString()}
                        </span>
                        <span className="text-black font-semibold">
                          ₦{product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span>₦{product.price.toLocaleString()}</span>
                    )}
                  </div>

                  <Link
                    to={`/product/${product._id}`}
                    onClick={closeCart}
                    className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black underline"
                  >
                    Quick View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CART COLUMN */}
        <div className="flex-1 flex flex-col h-full bg-white min-w-0">
          {/* Cart Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b shrink-0">
            <h2 className="text-base font-bold tracking-widest uppercase">Cart</h2>
            <button onClick={closeCart} aria-label="Close cart">
              <XMarkIcon className="h-5 w-5 text-gray-700 hover:text-black" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <p className="text-gray-500 text-center">
                Your cart is empty.{' '}
                <Link to="/" onClick={closeCart} className="text-black underline font-medium">
                  Go shopping
                </Link>
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto px-6 divide-y">
                {cartItems.map((item) => (
                  <div
                    key={`${item._id}-${item.size}`}
                    className="flex items-start gap-4 py-5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-sm flex-shrink-0 bg-gray-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-xs xl:text-sm uppercase tracking-wide leading-tight text-gray-900">
                          {item.name}
                        </h3>
                        <p className="font-semibold text-xs xl:text-sm text-gray-900 whitespace-nowrap">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>

                      <p className="text-[11px] text-gray-500 uppercase mt-1">
                        Size: {item.size}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-300 rounded-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.size, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.size, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id, item.size)}
                          aria-label="Remove item"
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* MOBILE SUGGESTIONS (Horizontal Carousel below items) */}
                {showSuggestions && (
                  <div className="lg:hidden py-6 border-t">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">
                      You May Also Like
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                      {relatedProducts.map((product) => (
                        <div key={product._id} className="w-28 shrink-0 text-center">
                          <Link
                            to={`/product/${product._id}`}
                            onClick={closeCart}
                            className="block aspect-[3/4] mb-1.5 overflow-hidden bg-gray-100 rounded-sm"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <p className="text-[10px] font-semibold truncate uppercase">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-gray-700 font-medium">
                            ₦{product.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order note button */}
              <button className="flex items-center justify-between w-full px-6 py-3 border-t text-xs font-medium text-gray-700 hover:text-black shrink-0">
                <span>Add order note</span>
                <span className="text-base leading-none">+</span>
              </button>

              {/* Footer Checkout Actions */}
              <div className="border-t px-6 pt-4 pb-6 shrink-0 bg-white">
                <p className="text-[11px] text-gray-500 text-center mb-3">
                  Taxes and shipping calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-black text-white text-center py-3 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition"
                >
                  CHECKOUT • ₦{total.toLocaleString()}
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-[11px] font-semibold underline text-gray-600 hover:text-black mt-3 tracking-wider uppercase"
                >
                  {/* VIEW CART */}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Cart