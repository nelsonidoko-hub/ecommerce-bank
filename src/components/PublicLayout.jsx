import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Cart from '../pages/Cart'
import Footer from './Footer'
import WhatsAppWidget from './WhatsAppWidget'

function PublicLayout() {
  return (
    <div>
      <Navbar />
      <Cart />
      <WhatsAppWidget />
      <Outlet />
      <Footer />
    </div>
  )
}

export default PublicLayout