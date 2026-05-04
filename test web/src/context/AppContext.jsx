import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import translations from '../i18n/translations';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

const DEFAULT_ADDRESSES = [
  { id: 1, type: 'Home', typeHi: 'घर', address: '42, Green Park Colony, Sector 15', city: 'Gurugram, Haryana - 122001', isDefault: true },
  { id: 2, type: 'Office', typeHi: 'ऑफिस', address: 'Tower B, Floor 4, Cyber City', city: 'Gurugram, Haryana - 122002', isDefault: false },
];

// ── Phone → synthetic email mapping (no SMS provider needed) ──────
const phoneToEmail = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return `phone_${digits}@farmdirect.app`;
};

export function AppProvider({ children }) {
  const [lang, setLang]                     = useState('en');
  const [cart, setCart]                     = useState([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [paymentMethod, setPaymentMethod]   = useState('upi');

  // ── Addresses ──────────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('fd-addresses');
      return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES;
    } catch { return DEFAULT_ADDRESSES; }
  });

  useEffect(() => {
    localStorage.setItem('fd-addresses', JSON.stringify(addresses));
  }, [addresses]);

  const addAddress = (addr) => {
    const newId = Math.max(0, ...addresses.map(a => a.id)) + 1;
    const newAddr = { ...addr, id: newId, isDefault: addresses.length === 0 };
    setAddresses(prev => [...prev, newAddr]);
    return newId;
  };

  const removeAddress = (id) => {
    setAddresses(prev => {
      const next = prev.filter(a => a.id !== id);
      if (selectedAddress === id && next.length > 0) setSelectedAddress(next[0].id);
      if (next.length > 0 && !next.some(a => a.isDefault)) {
        next[0].isDefault = true;
      }
      return next;
    });
  };

  const updateAddress = (id, updates) => {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // ── Location (GPS) ─────────────────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('fd-location');
      return saved ? JSON.parse(saved) : { label: 'Gurugram, HR', lat: null, lng: null, loading: false };
    } catch { return { label: 'Gurugram, HR', lat: null, lng: null, loading: false }; }
  });

  useEffect(() => {
    localStorage.setItem('fd-location', JSON.stringify(userLocation));
  }, [userLocation]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'en' ? 'Geolocation is not supported by your browser' : 'आपका ब्राउज़र जियोलोकेशन सपोर्ट नहीं करता');
      return;
    }
    setUserLocation(prev => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': lang === 'en' ? 'en' : 'hi' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const state = addr.state ? ', ' + (addr.state_code || addr.state).slice(0, 2).toUpperCase() : '';
          const label = city + state || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setUserLocation({ label, lat: latitude, lng: longitude, loading: false, full: data.display_name });
        } catch {
          setUserLocation({ label: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, lat: latitude, lng: longitude, loading: false });
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setUserLocation(prev => ({ ...prev, loading: false }));
        alert(lang === 'en' ? 'Unable to detect location. Please allow location access.' : 'स्थान पता नहीं चल सका। कृपया लोकेशन एक्सेस की अनुमति दें।');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fd-theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fd-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // Auth state
  const [session, setSession]       = useState(null);
  const [profile, setProfile]       = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const t = useCallback((key) => translations[lang]?.[key] || key, [lang]);
  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en');

  // ── Bootstrap session on mount ─────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
      else { setProfile(null); setFarmerProfile(null); setAuthLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(prof);

      if (prof?.role === 'farmer') {
        const { data: farmer } = await supabase
          .from('farmers')
          .select('*')
          .eq('user_id', userId)
          .single();
        setFarmerProfile(farmer);
      }
    } catch (e) {
      console.error('loadUserData error', e);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Auth helpers ───────────────────────────────────────────────────────────

  /** Standard email signup — used for consumers */
  const signUp = async (email, password, role, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({ id: userId, full_name: fullName, role });
      if (role === 'farmer') {
        const { data: farmer } = await supabase
          .from('farmers')
          .insert({ user_id: userId, name: fullName, verified: false })
          .select().single();
        setFarmerProfile(farmer);
      }
    }
    return data;
  };

  /** Standard email login — used for consumers */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  /**
   * Phone signup for farmers.
   * Maps phone → synthetic email, creates Supabase account with a fixed password
   * derived from the phone number (since OTP is mocked).
   */
  const signUpWithPhone = async (phone, fullName) => {
    const email    = phoneToEmail(phone);
    const password = `fd_${phone.replace(/\D/g, '')}_farmer`;

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role: 'farmer', phone } },
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId, full_name: fullName, role: 'farmer', phone,
      });
      const { data: farmer } = await supabase
        .from('farmers')
        .insert({ user_id: userId, name: fullName, verified: false })
        .select().single();
      setFarmerProfile(farmer);
    }
    return data;
  };

  /**
   * Phone login for farmers.
   * Looks up the synthetic email for this phone and signs in.
   */
  const signInWithPhone = async (phone) => {
    const email    = phoneToEmail(phone);
    const password = `fd_${phone.replace(/\D/g, '')}_farmer`;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setFarmerProfile(null);
    setCart([]);
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
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

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.id !== productId));

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.id === productId ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <AppContext.Provider value={{
      lang, t, toggleLang,
      theme, toggleTheme,
      cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount,
      searchQuery, setSearchQuery,
      selectedAddress, setSelectedAddress, paymentMethod, setPaymentMethod,
      addresses, addAddress, removeAddress, updateAddress,
      userLocation, detectLocation,
      // auth
      session, profile, farmerProfile, setFarmerProfile, authLoading,
      signUp, signIn, signUpWithPhone, signInWithPhone, signOut, loadUserData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
