import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useSettings } from '../hooks/useSettings'
import Navbar from './Navbar'
import Cart from '../pages/Cart'
import Footer from './Footer'
import WhatsAppWidget from './WhatsAppWidget'
import AnnouncementBar from './AnnouncementBar'
import { useStoreTheme } from '../hooks/useStoreTheme'
import StoreGate from './StoreGate'
import { packComponent, knownPart } from '../storefront/parts'

function PublicLayout() {
  // The wrapper carries the chosen template's colours, fonts and corners.
  // The admin area sits outside it, so it never changes with the template.
  const { className, style, layout } = useStoreTheme()
  // The template's menu bar: a pack's own component, or a style of the built-in one
  const PackNav = packComponent('nav', layout.nav)
  const { settings } = useSettings()

  // The browser tab shows the shop's own name
  useEffect(() => {
    if (settings?.storeName) document.title = settings.storeName
  }, [settings?.storeName])

  return (
    <div className={`${className} min-h-screen`} style={style}>
      {/* Visitors see "opening soon" while the shop isn't live; its owner sees a preview */}
      <StoreGate>
        <AnnouncementBar />
        {PackNav ? <PackNav /> : <Navbar variant={knownPart('nav', layout.nav, 'standard')} />}
        <Cart />
        <WhatsAppWidget />
        <Outlet />
        <Footer />
      </StoreGate>
    </div>
  )
}

export default PublicLayout