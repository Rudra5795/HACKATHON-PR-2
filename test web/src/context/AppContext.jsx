import { createContext, useContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const t = useCallback((key) => translations[lang]?.[key] || key, [lang]);

  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en');

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.id === productId ? { ...i, qty } : i));
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <AppContext.Provider value={{
      lang, t, toggleLang, cart, addToCart, removeFromCart, updateQty,
      cartTotal, cartCount, selectedAddress, setSelectedAddress,
      paymentMethod, setPaymentMethod,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
