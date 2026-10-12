import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  // Initialize state directly from localStorage if it exists, otherwise default to []
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartItems')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Failed to parse cart items from localStorage:', error)
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)

  // Sync cartItems to localStorage whenever the cart state changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
    } catch (error) {
      console.error('Failed to save cart items to localStorage:', error)
    }
  }, [cartItems])

  function openCart() {
    setIsCartOpen(true)
  }

  function closeCart() {
    setIsCartOpen(false)
  }

  function toggleCart() {
    setIsCartOpen((prev) => !prev)
  }

  function addToCart(product, size) {
    setCartItems((prevItems) => {
      // Only pop the drawer open the first time something lands in an
      // empty cart. Later adds/quantity bumps just update the badge
      // count quietly, unless the user clicks the cart icon themselves.
      if (prevItems.length === 0) {
        openCart()
      }

      const existingItem = prevItems.find(
        (item) => item._id === product._id && item.size === size
      )

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...prevItems, { ...product, size, quantity: 1 }]
    })
  }

  function removeFromCart(id, size) {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item._id === id && item.size === size))
    )
  }

  function updateQuantity(id, size, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(id, size)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // function clearCart() {
  //   setCartItems([])
  //   localStorage.removeItem('cartItems')
  // }

  function clearCart() {
    setCartItems([])
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}