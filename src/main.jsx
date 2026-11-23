import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'
import { installStoreHeaders, isPlatformSite } from './utils/storeContext'
import PlatformApp from './platform/PlatformApp.jsx'

// Every API call says which shop this is (see utils/storeContext.js)
installStoreHeaders()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* The platform's own site, or one shop (see utils/storeContext.js) */}
      {isPlatformSite ? (
        <PlatformApp />
      ) : (
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      )}
    </BrowserRouter>
  </StrictMode>,
)