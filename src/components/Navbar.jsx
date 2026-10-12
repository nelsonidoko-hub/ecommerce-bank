import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/img/logo.png'
import yl from '../assets/img/yl_png_logo.avif'
import { useState, useEffect } from 'react'
import { getCategories } from '../services/categoryService'
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  UserIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const location = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isHomePage = location.pathname === '/'
  const showTransparent = isHomePage && !isScrolled
  const textColor = showTransparent ? 'text-white' : 'text-gray-800'

  const { cartItems, toggleCart } = useCart()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <nav
      className={
        showTransparent
          ? 'absolute top-0 left-0 w-full z-50 text-white bg-transparent'
          : 'fixed top-0 left-0 w-full bg-white z-50 text-gray-800 shadow-md'
      }
    >
      {/* Desktop layout */}
      <div className="hidden lg:grid lg:grid-cols-3 items-center border-b p-10 py-2">
        <div className="flex xl:gap-6 gap-4 flex-wrap items-center">
          {categories.map((cat) => (
            <div key={cat._id} className="relative flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-1">
                <Link
                  to={`/category/${cat.name}`}
                  className={`font-poppins hover:text-blue-600 ${textColor} font-medium tracking-wide transition-colors whitespace-nowrap`}
                >
                  {cat.label}
                </Link>

                {cat.children?.length > 0 && (
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === cat.name ? null : cat.name)
                    }
                  >
                    <ChevronDownIcon className={`h-4 w-4 ${textColor}`} />
                  </button>
                )}
              </div>

              {cat.children?.length > 0 && openDropdown === cat.name && (
                <div className="absolute top-full left-0 bg-white shadow-md mt-2 py-2 min-w-[150px] font-poppins font-medium tracking-wide transition-colors whitespace-nowrap z-50">
                  {cat.children.map((child) => (
                    <Link
                      key={child._id}
                      to={`/category/${child.name}`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            <img src={yl} alt="Logo" className="h-8" />
          </Link>
        </div>

        <div className="flex justify-end gap-6">
          {user ? (
            <button
              onClick={logout}
              className={`capitalize font-poppins hover:cursor-pointer hover:text-blue-600 ${textColor} font-medium tracking-wide transition-colors whitespace-nowrap`}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={`${textColor} capitalize font-poppins hover:text-blue-600 font-medium tracking-wide transition-colors whitespace-nowrap`}
            >
              Login
            </Link>
          )}

          {user && (
            <Link to="/orders" className={`capitalize font-poppins hover:text-blue-600 ${textColor} font-medium tracking-wide whitespace-nowrap`}>
              Orders
            </Link>
          )}

          
          {/* search start */}
          <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <MagnifyingGlassIcon className={`h-5 w-5 ${textColor}`} />
          </button>

          {isSearchOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-[60] flex items-start justify-center pt-24 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <form
              onSubmit={handleSearchSubmit}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-4 w-full max-w-md flex gap-2"
            >
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
              />
              <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md">
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-500 px-2"
              >
                ✕
              </button>
            </form>
          </div>
          )}

          {/* search ends */}
          <button
            onClick={toggleCart}
            className={`flex items-center gap-1 capitalize font-poppins hover:text-blue-600 ${textColor} font-medium tracking-wide transition-colors whitespace-nowrap`}
          >
            <ShoppingBagIcon className="h-5 w-5" /> {totalItems}
          </button>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div
        className={
          showTransparent
            ? 'flex lg:hidden items-center justify-between px-4 py-3 absolute top-0 left-0 w-full bg-transparent'
            : 'flex lg:hidden items-center justify-between px-4 py-3 fixed top-0 left-0 w-full bg-white shadow-sm z-50'
        }
      >
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-1 focus:outline-none"
          aria-label="Open menu"
        >
          <Bars3Icon className={`h-6 w-6 ${showTransparent ? 'text-white' : 'text-gray-900'}`} />
        </button>

        <Link to="/" className="text-xl font-bold text-blue-600">
          <img src={yl} alt="Logo" className="h-7" />
        </Link>

        <div className="flex items-center gap-4">
          <button className={`p-1 ${textColor}`}>
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button
            onClick={toggleCart}
            className={`flex items-center gap-1 p-1 ${textColor} font-medium`}
          >
            <ShoppingBagIcon className="h-5 w-5" />
            <span className="text-xs font-semibold">{totalItems}</span>
          </button>
        </div>
      </div>

      {/* Full-Screen Shopify Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white z-50 flex flex-col justify-between transition-all duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1 text-gray-800 hover:text-black transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <img src={yl} alt="Logo" className="h-6 object-contain" />
          </Link>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsSearchOpen(true)} className={`p-1 ${textColor}`}>
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setIsMenuOpen(false)
                setIsSearchOpen(true)
              }}
              className="text-gray-800 p-1"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false)
                toggleCart()
              }}
              className="relative text-gray-800 p-1"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Category List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-gray-100">
          {user && (
            <Link
              to="/orders"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 py-4 text-base font-medium text-gray-900 hover:text-black transition"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              Track Order
            </Link>
          )}

          {categories.map((cat) => (
            <div key={cat._id} className="py-4">
              <div className="flex items-center justify-between">
                <Link
                  to={`/category/${cat.name}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-base font-normal text-gray-800 hover:text-black transition"
                >
                  {cat.label}
                </Link>

                {cat.children?.length > 0 && (
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === cat.name ? null : cat.name)
                    }
                    className="text-gray-400 hover:text-gray-700 p-1"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Collapsible Submenu */}
              {cat.children?.length > 0 && openDropdown === cat.name && (
                <div className="mt-3 pl-2 space-y-2 border-l-2 border-gray-200">
                  {cat.children.map((child) => (
                    <Link
                      key={child._id}
                      to={`/category/${child.name}`}
                      onClick={() => {
                        setIsMenuOpen(false)
                        setOpenDropdown(null)
                      }}
                      className="block text-sm text-gray-500 hover:text-gray-900 py-1"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar: Login / Logout & Currency Selector */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 bg-white">
          <div>
            {user ? (
              <button
                onClick={() => {
                  logout()
                  setIsMenuOpen(false)
                }}
                className="font-medium text-gray-800 hover:text-black transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="font-medium text-gray-800 hover:text-black transition"
              >
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 cursor-pointer font-medium text-gray-800">
            <span>NGN</span>
            <ChevronDownIcon className="h-3 w-3 text-gray-500" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar