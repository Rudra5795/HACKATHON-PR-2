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
import ProfileDashboard from './pages/ProfileDashboard';
import AuthPage from './pages/AuthPage';
import './App.css';

// ── Role-based route guard ─────────────────────────────────────────────────────
// allowedRole: 'consumer' | 'farmer' | null (null = any logged-in user)
// If the user isn't logged in → go to /auth
// If logged in but wrong role → redirect to their own dashboard
function RoleRoute({ allowedRole, children }) {
  const { session, profile, authLoading } = useApp();

  if (authLoading) return null; // still loading session

  // Not logged in → auth page
  if (!session) return <Navigate to="/auth" replace />;

  const userRole = profile?.role || 'consumer';

  // If a specific role is required and user doesn't match → redirect
  if (allowedRole && userRole !== allowedRole) {
    const home = userRole === 'farmer' ? '/farmer' : '/shop';
    return <Navigate to={home} replace />;
  }

  return children;
}

// Show a loading spinner while Supabase session is being restored
function AppShell() {
  const { authLoading, session, profile } = useApp();

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

  const userRole = profile?.role || 'consumer';

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public pages */}
        <Route path="/"     element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Consumer-only pages */}
        <Route path="/shop"       element={<RoleRoute allowedRole="consumer"><ConsumerDashboard /></RoleRoute>} />
        <Route path="/product/:id" element={<RoleRoute allowedRole="consumer"><ProductPage /></RoleRoute>} />
        <Route path="/checkout"   element={<RoleRoute allowedRole="consumer"><CheckoutPage /></RoleRoute>} />
        <Route path="/tracking"   element={<RoleRoute allowedRole="consumer"><OrderTrackingPage /></RoleRoute>} />

        {/* Farmer-only pages */}
        <Route path="/farmer" element={<RoleRoute allowedRole="farmer"><FarmerDashboard /></RoleRoute>} />

        {/* Shared — any logged-in user */}
        <Route path="/profile" element={<RoleRoute allowedRole={null}><ProfileDashboard /></RoleRoute>} />

        {/* Catch-all: redirect to appropriate home */}
        <Route path="*" element={
          session
            ? <Navigate to={userRole === 'farmer' ? '/farmer' : '/shop'} replace />
            : <Navigate to="/" replace />
        } />
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
