import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { LandingPage } from './components/LandingPage'
import { LoginPage } from './components/LoginPage'
import { RegisterPage } from './components/RegisterPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminPanel } from './admin/AdminPanel'
import { PaymentSuccess } from './components/PaymentSuccess'
import { PaymentCancel } from './components/PaymentCancel'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SiteSettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/giris" element={<LoginPage />} />
            <Route path="/kayit" element={<RegisterPage />} />
            <Route path="/app" element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/admin/*" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </SiteSettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
