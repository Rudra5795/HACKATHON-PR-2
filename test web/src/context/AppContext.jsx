import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import translations from '../i18n/translations';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang]                     = useState('en');
  const [cart, setCart]                     = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [paymentMethod, setPaymentMethod]   = useState('upi');

  // Auth state
  const [session, setSession]       = useState(null);
  const [profile, setProfile]       = useState(null);   // profiles row
  const [farmerProfile, setFarmerProfile] = useState(null); // farmers row
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
      // Load profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(prof);

      // If farmer, load farmer row
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
  const signUp = async (email, password, role, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      // Upsert profile row
      await supabase.from('profiles').upsert({ id: userId, full_name: fullName, role });

      // If farmer, create farmer row
      if (role === 'farmer') {
        const { data: farmer } = await supabase
          .from('farmers')
          .insert({ user_id: userId, name: fullName, verified: false })
          .select().single();
        setFarmerProfile(farmer);
      }
    }

    return data; // contains { user, session } — session is non-null when email confirm is OFF
  };

  const signIn = async (email, password) => {
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

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <AppContext.Provider value={{
      lang, t, toggleLang,
      cart, addToCart, removeFromCart, updateQty, cartTotal, cartCount,
      selectedAddress, setSelectedAddress, paymentMethod, setPaymentMethod,
      // auth
      session, profile, farmerProfile, setFarmerProfile, authLoading,
      signUp, signIn, signOut, loadUserData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
