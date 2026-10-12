import { Link } from 'react-router-dom'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'

function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, isCartOpen, closeCart } = useCart()

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold uppercase">Cart</h2>
          <button onClick={closeCart}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium uppercase">{item.name}</h3>
                    <p className="text-sm font-semibold mt-1">₦{item.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.size}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                          className="w-7 h-7 hover:bg-gray-100 text-sm"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                          className="w-7 h-7 hover:bg-gray-100 text-sm"
                        >
                          +
                        </button>
                      </div>

                      <button onClick={() => removeFromCart(item._id, item.size)}>
                        <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-6">
            <p className="text-xs text-gray-500 mb-4">Taxes and shipping calculated at checkout</p>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full bg-gray-900 text-white text-center py-3 rounded-md font-semibold hover:bg-gray-800 transition"
            >
              Checkout · ₦{total.toLocaleString()}
            </Link>

            <Link
              to="/cart"
              onClick={closeCart}
              className="block text-center text-sm text-gray-600 hover:underline mt-3"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer