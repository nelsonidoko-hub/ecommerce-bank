import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Cart from '../pages/Cart'
import Footer from './Footer'
import WhatsAppWidget from './WhatsAppWidget'
import AnnouncementBar from './AnnouncementBar'
import { useStoreTheme } from '../hooks/useStoreTheme'

function PublicLayout() {
  // The wrapper carries the chosen template's colours, fonts and corners.
  // The admin area sits outside it, so it never changes with the template.
  const { className, style } = useStoreTheme()

  return (
    <div className={`${className} min-h-screen`} style={style}>
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