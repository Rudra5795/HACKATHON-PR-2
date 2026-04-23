import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import ConsumerDashboard from './pages/ConsumerDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AuthPage from './pages/AuthPage';
import './App.css';

// Show a loading spinner while Supabase session is being restored
function AppShell() {
  const { authLoading } = useApp();

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌿</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading FarmDirect...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/shop"      element={<ConsumerDashboard />} />
        <Route path="/farmer"    element={<FarmerDashboard />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout"  element={<CheckoutPage />} />
        <Route path="/tracking"  element={<OrderTrackingPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
