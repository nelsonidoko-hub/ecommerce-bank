import axios from 'axios'

const API_URL = 'https://abuja-store-backend.onrender.com/api/products'



const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
})


export const getProducts = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`)
  return response.data
}

export const getProductsByCategory = async (categoryName) => {
  const response = await axios.get(`${API_URL}/category/${categoryName}`)
  return response.data
}

export const getBestSellers = async () => {
  const response = await axios.get(`${API_URL}/bestsellers`);
  return response.data
}

export const createProduct = async (productData, token) => {
  const response = await axios.post(API_URL, productData, authHeader(token))
  return response.data
}

export const updateProduct = async (id, productData, token) => {
  const response = await axios.put(`${API_URL}/${id}`, productData, authHeader(token))
  return response.data
}

export const deleteProduct = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader(token))
  return response.data
}

export const searchProducts = async (query) => {
  const response = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`)
  return response.data
}