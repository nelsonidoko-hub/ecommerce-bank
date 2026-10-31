import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Cart from '../pages/Cart'
import Footer from './Footer'
import WhatsAppWidget from './WhatsAppWidget'
import AnnouncementBar from './AnnouncementBar'

function PublicLayout() {
  return (
    <div>
      <AnnouncementBar />
      <Navbar />
      <Cart />
      <WhatsAppWidget />
      <Outlet />
      <Footer />
    </div>
  )
}

export default PublicLayout