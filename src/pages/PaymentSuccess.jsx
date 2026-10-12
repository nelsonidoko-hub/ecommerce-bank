import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { verifyPayment } from '../services/paymentService'
import { orderRef } from '../utils/orderStatus'

function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const reference = searchParams.get('reference')
  const { user } = useAuth()
  const { clearCart } = useCart()
  const [status, setStatus] = useState(reference ? 'verifying' : 'failed')
  const [order, setOrder] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verify() {
      try {
        const result = await verifyPayment(reference, user.token)
        if (result.success) {
          setOrder(result.order)
          setStatus('success')
          clearCart()
        } else {
          setStatus('failed')
        }
      }catch (err) {
        setMessage(err.response?.data?.message || '')
        setStatus('failed')
      }
    }

    if (reference && user) verify()
  }, [reference, user])

  return (
    <div className="px-6 md:px-10 pt-28 pb-12 max-w-xl mx-auto text-center">
      {status === 'verifying' && <p>Confirming your payment...</p>}

      {status === 'success' && order && (
        <>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment successful</h2>
          {message && <p className="text-gray-700 mb-4">{message}</p>}
          <p className="mb-1">Your order number is <b>{orderRef(order)}</b>.</p>
          <p className="text-gray-500 mb-6">
            We have emailed you a confirmation and will update you as your order moves along.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to={`/orders/${order._id}`} className="bg-gray-900 text-white px-5 py-2 rounded-md">
              Track order
            </Link>
            <Link to="/shop" className="border px-5 py-2 rounded-md">Keep shopping</Link>
          </div>
        </>
      )}

      {status === 'failed' && (
        <>
          <h2 className="text-2xl font-bold text-red-600 mb-2">We could not confirm your payment</h2>
          <p className="text-gray-500 mb-6">
            If money left your account, please do not pay again. Check My Orders, as we also confirm payments
            automatically and will email you.
          </p>
          <Link to="/orders" className="bg-gray-900 text-white px-5 py-2 rounded-md">My Orders</Link>
        </>
      )}
    </div>
  )
}

export default PaymentSuccess