import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Survey from './pages/Survey.jsx'
import ThankYou from './pages/ThankYou.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminQrCode from './pages/AdminQrCode.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/avaliar" element={<Survey />} />
      <Route path="/obrigado" element={<ThankYou />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/painel" element={<AdminDashboard />} />
      <Route path="/admin/qrcode" element={<AdminQrCode />} />
    </Routes>
  )
}
