import axios from 'axios'

const API_URL = 'https://abuja-store-backend.onrender.com/api/orders'

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})

export const createOrder = async (orderData, token) => {
  const response = await axios.post(API_URL, orderData, authHeader(token))
  return response.data
}

export const getMyOrders = async (token) => {
  const response = await axios.get(`${API_URL}/my-orders`, authHeader(token))
  return response.data
}

export const getAllOrders = async (token) => {
  const response = await axios.get(API_URL, authHeader(token))
  return response.data
}

export const getOrderById = async (id, token) => {
  const response = await axios.get(`${API_URL}/${id}`, authHeader(token))
  return response.data
}

export const updateOrderStatus = async (orderId, payload, token) => {
  const response = await axios.put(`${API_URL}/${orderId}/status`, payload, authHeader(token))
  return response.data
}

export const cancelOrder = async (orderId, token) => {
  const response = await axios.put(`${API_URL}/${orderId}/cancel`, {}, authHeader(token))
  return response.data
}

export const getOrdersByUserId = async (userId, token) => {
  const orders = await getAllOrders(token)
  return orders.filter(
    (order) => order.user === userId || order.user?._id === userId
  )
}