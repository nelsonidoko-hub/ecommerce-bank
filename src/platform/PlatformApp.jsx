import { Routes, Route, Navigate } from 'react-router-dom'
import PlatformLayout from './PlatformLayout'
import Landing from './pages/Landing'
import Templates from './pages/Templates'
import Signup from './pages/Signup'
import PlatformLogin from './pages/PlatformLogin'
import Dashboard from './pages/Dashboard'
import NewShop from './pages/NewShop'
import PlatformForgot from './pages/PlatformForgot'
import PlatformReset from './pages/PlatformReset'
import { Terms, AcceptableUse } from './pages/Legal'
import FounderHome from './pages/founder/FounderHome'
import FounderShop from './pages/founder/FounderShop'
import Market from './pages/Market'
import StudioList from './pages/studio/StudioList'
import StudioEditor from './pages/studio/StudioEditor'

// The platform's own site (yourplatform.com). Shops are a separate app (App.jsx).
function PlatformApp() {
  return (
    <Routes>
      <Route element={<PlatformLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<PlatformLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-shop" element={<NewShop />} />
        <Route path="/forgot-password" element={<PlatformForgot />} />
        <Route path="/reset-password/:token" element={<PlatformReset />} />
        <Route path="/market" element={<Market />} />
        <Route path="/studio" element={<StudioList />} />
        <Route path="/studio/new" element={<StudioEditor />} />
        <Route path="/studio/:id" element={<StudioEditor />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/acceptable-use" element={<AcceptableUse />} />
        <Route path="/founder" element={<FounderHome />} />
        <Route path="/founder/shops/:id" element={<FounderShop />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default PlatformApp
