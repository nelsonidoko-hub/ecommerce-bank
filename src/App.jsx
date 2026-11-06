import { Routes, Route } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRegister from './pages/admin/AdminRegister'
import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCategories from './pages/admin/AdminCategories'
import SearchResults from './pages/SearchResults'
import Shop from './pages/Shop'
import MyOrders from './pages/MyOrders'
import OrderDetail from './pages/OrderDetail'
import AdminLogo from './pages/admin/AdminLogo'
import AdminHero from './pages/admin/AdminHero'
import AdminSettings from './pages/admin/AdminSettings'
import AdminHomepage from './pages/admin/AdminHomepage'
import AdminDiscounts from './pages/admin/AdminDiscounts'
import AdminPages from './pages/admin/AdminPages'
import AdminPayments from './pages/admin/AdminPayments'
import PageView from './pages/PageView'


function App() {
  return (
    <Routes>
      {/* Public storefront — Navbar + Cart render once via PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path=":slug" element={<PageView />} />
        
      </Route>

      {/* Admin — AdminLayout provides its own sidebar, no storefront Navbar.
          AdminRoute guards the whole section once instead of on every page. */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="logo" element={<AdminLogo />} />
        <Route path="hero" element={<AdminHero />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="discounts" element={<AdminDiscounts />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="pages" element={<AdminPages />} />

      </Route>

      {/* Standalone — first-admin setup, intentionally outside both layouts */}
      <Route path="/admin/setup" element={<AdminRegister />} />
    </Routes>
  )
}

export default App