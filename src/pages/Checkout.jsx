import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../services/orderService'
import { initializePayment } from '../services/paymentService'
import { QuestionMarkCircleIcon, ShoppingBagIcon, BuildingStorefrontIcon, TruckIcon } from '@heroicons/react/24/outline'

function Checkout() {
  const { cartItems } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Delivery Method State
  const [deliveryMethod, setDeliveryMethod] = useState('ship') // 'ship' | 'pickup'

  // Contact State
  const [email, setEmail] = useState(user?.email || '')

  // Shipping Address State
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [apartment, setApartment] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Federal Capital Territory')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')

  // Billing Address State
  const [billingAddressType, setBillingAddressType] = useState('same') // 'same' | 'different'
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Federal Capital Territory',
    postalCode: '',
  })

  const [saveInfo, setSaveInfo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculation Constants (Shipping is free on Pickup)
  const baseShippingCost = 3500
  const shippingCost = deliveryMethod === 'pickup' ? 0 : baseShippingCost
  const estimatedTax = 7500
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const finalTotal = subtotal + shippingCost + estimatedTax

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-700 font-medium mb-4">Please log in to proceed with checkout.</p>
          <Link
            to="/login"
            className="inline-block w-full bg-black text-white py-2.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
        })),
        deliveryMethod,
        shippingAddress:
          deliveryMethod === 'ship'
            ? {
                firstName,
                lastName,
                address,
                apartment,
                city,
                state,
                postalCode,
                phone,
              }
            : {
                method: 'Store Pickup',
                location: 'Main Retail Store Branch',
                phone,
              },
        billingAddress:
          billingAddressType === 'same'
            ? deliveryMethod === 'ship'
              ? { firstName, lastName, address, apartment, city, state, postalCode }
              : 'Same as pickup'
            : billingAddress,
        subtotal,
        shippingCost,
        estimatedTax,
        totalPrice: finalTotal,
      }

      const order = await createOrder(orderData, user.token)
      const payment = await initializePayment(order._id, user.token)

      window.location.href = payment.data.authorization_url
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-20 lg:pt-24 pb-12">
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: Form Fields */}
        <div className="flex-1 px-4 sm:px-8 lg:px-16 pt-8 pb-16 lg:max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {/* Your Store Name */}
            </h1>
            <ShoppingBagIcon className="w-6 h-6 text-blue-600 lg:hidden" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-900">Contact</h2>
                <span className="text-xs text-gray-500">
                  Logged in as <span className="font-semibold">{user.email}</span>
                </span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                />
                <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">Email me with news and offers</span>
              </label>
            </div>

            {/* Delivery Method Toggle Tabs */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Delivery method</h2>
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('ship')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    deliveryMethod === 'ship'
                      ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <TruckIcon className="w-4 h-4" />
                  Ship
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    deliveryMethod === 'pickup'
                      ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  Pick up
                </button>
              </div>
            </div>

            {/* Delivery Form (Conditional on Ship vs Pickup) */}
            {deliveryMethod === 'ship' ? (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping address</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Country/Region</label>
                    <select
                      disabled
                      className="w-full border border-gray-300 bg-gray-50 rounded-lg px-3.5 py-3 text-sm font-medium text-gray-800 outline-none"
                    >
                      <option value="NG">Nigeria</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="border border-gray-300 rounded-lg px-2.5 py-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none truncate"
                    >
                      <option value="Federal Capital Territory">Federal Capital Territory</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Ondo">Ondo</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Kano">Kano</option>
                      <option value="Oyo">Oyo</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Postal code (optional)"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                    />
                    <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">Save this information for next time</span>
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Pickup location</h2>
                <div className="border border-gray-300 bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Main Retail Store</p>
                      <p className="text-xs text-gray-600 mt-0.5">123 Business Avenue, Suite 4, Central Area</p>
                    </div>
                    <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Usually ready in 2 to 4 hours</p>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact phone for pickup notification
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Shipping Method Rate Display */}
            {deliveryMethod === 'ship' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping method</h2>
                <div className="border-2 border-blue-600 bg-blue-50/20 rounded-xl p-4 flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-900">Standard Delivery</span>
                  <span className="font-bold text-gray-900">₦{shippingCost.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900">Payment</h2>
              <p className="text-xs text-gray-500 mb-3">All transactions are secure and encrypted.</p>

              <div className="border border-blue-600 rounded-xl overflow-hidden">
                <div className="bg-blue-50/30 p-4 flex justify-between items-center border-b border-blue-100">
                  <span className="font-bold text-sm text-gray-900">Paystack</span>
                  <div className="flex gap-1 items-center">
                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">MC</span>
                    <span className="text-[10px] bg-blue-700 text-white font-bold px-1.5 py-0.5 rounded">VISA</span>
                    <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-1 py-0.5 rounded">+5</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 text-center text-xs text-gray-600">
                  You'll be redirected to Paystack to complete your purchase securely.
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Billing address</h2>
              <div className="border border-gray-300 rounded-xl overflow-hidden divide-y">
                {/* Same Address Option */}
                <label className={`flex items-center gap-3 p-4 cursor-pointer text-sm font-medium ${
                  billingAddressType === 'same' ? 'bg-blue-50/30' : ''
                }`}>
                  <input
                    type="radio"
                    name="billing"
                    value="same"
                    checked={billingAddressType === 'same'}
                    onChange={() => setBillingAddressType('same')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">
                    {deliveryMethod === 'ship' ? 'Same as shipping address' : 'Same as pickup store'}
                  </span>
                </label>

                {/* Different Address Option & Dynamic Form */}
                <div>
                  <label className={`flex items-center gap-3 p-4 cursor-pointer text-sm font-medium ${
                    billingAddressType === 'different' ? 'bg-blue-50/30' : ''
                  }`}>
                    <input
                      type="radio"
                      name="billing"
                      value="different"
                      checked={billingAddressType === 'different'}
                      onChange={() => setBillingAddressType('different')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">Use a different billing address</span>
                  </label>

                  {billingAddressType === 'different' && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="First name"
                          value={billingAddress.firstName}
                          onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })}
                          required={billingAddressType === 'different'}
                          className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <input
                          type="text"
                          placeholder="Last name"
                          value={billingAddress.lastName}
                          onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })}
                          required={billingAddressType === 'different'}
                          className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Address"
                        value={billingAddress.address}
                        onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                        required={billingAddressType === 'different'}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <input
                        type="text"
                        placeholder="Apartment, suite, etc. (optional)"
                        value={billingAddress.apartment}
                        onChange={(e) => setBillingAddress({ ...billingAddress, apartment: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                          required={billingAddressType === 'different'}
                          className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <select
                          value={billingAddress.state}
                          onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                          className="border border-gray-300 rounded-lg px-2 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-600 truncate"
                        >
                          <option value="Federal Capital Territory">Federal Capital Territory</option>
                          <option value="Lagos">Lagos</option>
                          <option value="Ondo">Ondo</option>
                          <option value="Rivers">Rivers</option>
                          <option value="Kano">Kano</option>
                          <option value="Oyo">Oyo</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Postal code"
                          value={billingAddress.postalCode}
                          onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition duration-200 text-base shadow-sm disabled:opacity-50"
            >
              {loading ? 'Redirecting to Paystack...' : 'Pay now'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary Sidebar */}
        <div className="w-full lg:w-[480px] bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 px-4 sm:px-8 lg:px-12 py-8 shrink-0">
          <div className="lg:sticky lg:top-8 space-y-6">
            
            {/* Cart Items List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 bg-black/80 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase mt-0.5">
                        {item.size}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Line Item Pricing breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-xs sm:text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal · {totalItemCount} items</span>
                <span className="font-semibold text-gray-900">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Shipping <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400" />
                </span>
                <span className="font-semibold text-gray-900">
                  {deliveryMethod === 'pickup' ? 'Free' : `₦${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Estimated taxes <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400" />
                </span>
                <span className="font-semibold text-gray-900">₦{estimatedTax.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-xs text-gray-500 mr-1.5 font-medium">NGN</span>
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  ₦{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Checkout