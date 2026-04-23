import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import ConsumerDashboard from './pages/ConsumerDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ConsumerDashboard />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/tracking" element={<OrderTrackingPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AppProvider>
  );
}
