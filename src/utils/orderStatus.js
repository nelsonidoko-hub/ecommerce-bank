export const STATUS_LABELS = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const TIMELINE = ['pending', 'paid', 'processing', 'shipped', 'delivered']

export const TIMELINE_LABELS = {
  pending: 'Order placed',
  paid: 'Payment confirmed',
  processing: 'Being prepared',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

export const orderRef = (o) => o.orderNumber || `#${o._id.slice(-8).toUpperCase()}`