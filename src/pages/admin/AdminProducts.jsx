import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProducts, deleteProduct } from '../../services/productService'
import { Link } from 'react-router-dom'

function AdminProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const data = await getProducts()
    setProducts(data)
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await deleteProduct(id, user.token)
    loadProducts()
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-10 pt-30">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Link to="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-md">
          + Add Product
        </Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Price</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2 capitalize">{p.category}</td>
              <td className="p-2">₦{p.price}</td>
              <td className="p-2">{p.stock}</td>
              <td className="p-2 flex gap-3">
                <Link to={`/admin/products/${p._id}/edit`} className="text-blue-600 hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminProducts