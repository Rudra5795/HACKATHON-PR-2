import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
  User, Mail, MapPin, ShoppingBag, Heart, Clock,
  Settings, Shield, CreditCard, Bell, ChevronRight,
  Package, Star, Award, TrendingUp, Edit3, Camera, LogOut, Sprout,
  BarChart3, PlusCircle, Truck
} from 'lucide-react';

export default function ProfileDashboard() {
  const { session, profile, farmerProfile, lang, signOut, cart, cartCount } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/auth');
      return;
    }
    // Load recent orders
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setOrders(data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [session, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!session) return null;

  const userName = profile?.full_name || session.user.email?.split('@')[0] || 'User';
  const userEmail = session.user.email;
  const userRole = profile?.role || 'consumer';
  const isFarmer = userRole === 'farmer';
  const isConsumer = userRole === 'consumer';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = new Date(session.user.created_at).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', { year: 'numeric', month: 'long' });

  const tabs = [
    { id: 'overview', label: lang === 'en' ? 'Overview' : 'अवलोकन', icon: <User size={16} /> },
    { id: 'orders',   label: isFarmer ? (lang === 'en' ? 'Farm Orders' : 'फ़ार्म ऑर्डर') : (lang === 'en' ? 'My Orders' : 'मेरे ऑर्डर'), icon: <Package size={16} /> },
    { id: 'settings', label: lang === 'en' ? 'Settings' : 'सेटिंग्स', icon: <Settings size={16} /> },
  ];

  // ── Role-specific stats ───────────────────────────────────────────────────
  const quickStats = isFarmer
    ? [
        { icon: <Package size={20} />, value: orders.length, label: lang === 'en' ? 'Total Orders' : 'कुल ऑर्डर', color: '#3B82F6' },
        { icon: <Sprout size={20} />, value: farmerProfile ? '✓' : '—', label: lang === 'en' ? 'Farm Verified' : 'फ़ार्म सत्यापित', color: '#10B981' },
        { icon: <Star size={20} />, value: farmerProfile?.rating || '4.8', label: lang === 'en' ? 'Rating' : 'रेटिंग', color: '#F59E0B' },
        { icon: <Award size={20} />, value: 'Pro', label: lang === 'en' ? 'Farmer Tier' : 'किसान टियर', color: '#8B5CF6' },
      ]
    : [
        { icon: <ShoppingBag size={20} />, value: orders.length, label: lang === 'en' ? 'Total Orders' : 'कुल ऑर्डर', color: '#3B82F6' },
        { icon: <Heart size={20} />, value: cartCount, label: lang === 'en' ? 'In Cart' : 'कार्ट में', color: '#EF4444' },
        { icon: <Star size={20} />, value: '5.0', label: lang === 'en' ? 'Rating' : 'रेटिंग', color: '#F59E0B' },
        { icon: <Award size={20} />, value: 'Gold', label: lang === 'en' ? 'Member Tier' : 'सदस्य टियर', color: '#8B5CF6' },
      ];

  // ── Role-specific quick actions ────────────────────────────────────────────
  const quickActions = isFarmer
    ? [
        { icon: <Sprout size={20} />, label: lang === 'en' ? 'Farm Dashboard' : 'फ़ार्म डैशबोर्ड', to: '/farmer', color: '#15803D' },
        { icon: <PlusCircle size={20} />, label: lang === 'en' ? 'Add Product' : 'उत्पाद जोड़ें', to: '/farmer', color: '#3B82F6' },
        { icon: <BarChart3 size={20} />, label: lang === 'en' ? 'View Earnings' : 'कमाई देखें', to: '/farmer', color: '#8B5CF6' },
        { icon: <Truck size={20} />, label: lang === 'en' ? 'Manage Orders' : 'ऑर्डर प्रबंधित करें', to: '/farmer', color: '#F59E0B' },
      ]
    : [
        { icon: <ShoppingBag size={20} />, label: lang === 'en' ? 'Browse Shop' : 'दुकान देखें', to: '/shop', color: 'var(--green)' },
        { icon: <Package size={20} />, label: lang === 'en' ? 'Track Orders' : 'ऑर्डर ट्रैक करें', to: '/tracking', color: '#3B82F6' },
        { icon: <CreditCard size={20} />, label: lang === 'en' ? 'Checkout' : 'चेकआउट', to: '/checkout', color: '#8B5CF6' },
      ];

  return (
    <main className="profile-dashboard">
      <div className="container">
        {/* Profile Header */}
        <div className={`profile-header fade-in-up ${isFarmer ? 'farmer-theme' : 'consumer-theme'}`}>
          <div className={`profile-header-bg ${isFarmer ? 'farmer' : ''}`}></div>
          <div className="profile-header-content">
            <div className="profile-avatar-large">
              <span className={`profile-initials-large ${isFarmer ? 'farmer' : ''}`}>{initials}</span>
              <button className="avatar-edit-btn" id="avatar-edit-btn" aria-label="Edit avatar">
                <Camera size={14} />
              </button>
            </div>
            <div className="profile-header-info">
              <h1>{userName}</h1>
              <p className="profile-email"><Mail size={14} /> {userEmail}</p>
              <div className="profile-badges">
                <span className={`badge ${isFarmer ? 'badge-yellow' : 'badge-green'}`}>
                  {isFarmer ? (lang === 'en' ? '🌾 Farmer' : '🌾 किसान') : (lang === 'en' ? '🛒 Consumer' : '🛒 ग्राहक')}
                </span>
                <span className="badge" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                  {lang === 'en' ? `Member since ${memberSince}` : `सदस्य ${memberSince} से`}
                </span>
                {isFarmer && farmerProfile?.verified && (
                  <span className="badge badge-green">
                    ✓ {lang === 'en' ? 'Verified Farmer' : 'सत्यापित किसान'}
                  </span>
                )}
              </div>
            </div>
            <div className="profile-header-actions">
              <Link to={isFarmer ? '/farmer' : '/shop'} className="btn btn-ghost btn-sm" id="goto-dashboard-link">
                {isFarmer ? <Sprout size={14} /> : <ShoppingBag size={14} />}
                {isFarmer ? (lang === 'en' ? 'Go to Farm' : 'फ़ार्म पर जाएं') : (lang === 'en' ? 'Go to Shop' : 'दुकान पर जाएं')}
              </Link>
              <button onClick={handleSignOut} className="btn btn-sm" id="profile-logout-btn"
                style={{ background: '#FEF2F2', color: '#DC2626' }}>
                <LogOut size={14} /> {lang === 'en' ? 'Logout' : 'लॉगआउट'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="profile-stats fade-in-up stagger-1">
          {quickStats.map((stat, i) => (
            <div key={i} className="profile-stat-card glass-card">
              <div className="stat-icon" style={{ background: stat.color + '15', color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="profile-tabs fade-in-up stagger-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content fade-in">
          {activeTab === 'overview' && (
            <div className="profile-overview">
              {/* Quick Actions */}
              <div className="profile-section">
                <h2 className="profile-section-title">
                  <TrendingUp size={20} /> {lang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
                </h2>
                <div className="quick-actions-grid">
                  {quickActions.map((action, i) => (
                    <Link to={action.to} key={i} className="quick-action-card glass-card" id={`quick-action-${i}`}>
                      <div className="quick-action-icon" style={{ background: action.color + '12', color: action.color }}>
                        {action.icon}
                      </div>
                      <span>{action.label}</span>
                      <ChevronRight size={16} className="quick-action-arrow" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="profile-section">
                <h2 className="profile-section-title">
                  <Clock size={20} /> {lang === 'en' ? 'Recent Activity' : 'हाल की गतिविधि'}
                </h2>
                <div className="activity-list glass-card">
                  {loadingOrders ? (
                    <div className="activity-loading">
                      <div className="spinner"></div>
                      <p>{lang === 'en' ? 'Loading activity...' : 'गतिविधि लोड हो रही है...'}</p>
                    </div>
                  ) : orders.length > 0 ? (
                    orders.slice(0, 5).map((order, i) => (
                      <div key={i} className="activity-item">
                        <div className="activity-icon">
                          <Package size={16} />
                        </div>
                        <div className="activity-info">
                          <p className="activity-title">
                            {lang === 'en' ? 'Order' : 'ऑर्डर'} #{order.id?.slice(0, 8)}
                          </p>
                          <p className="activity-time">
                            {new Date(order.created_at).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN')}
                          </p>
                        </div>
                        <span className={`status-badge status-${order.status || 'new'}`}>
                          {order.status || 'new'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="activity-empty">
                      <div style={{ fontSize: '3rem', marginBottom: 12 }}>{isFarmer ? '🌾' : '📦'}</div>
                      <p>
                        {isFarmer
                          ? (lang === 'en' ? 'No orders received yet. Add products to start selling!' : 'अभी तक कोई ऑर्डर नहीं आया। बेचने के लिए उत्पाद जोड़ें!')
                          : (lang === 'en' ? 'No orders yet. Start shopping!' : 'अभी तक कोई ऑर्डर नहीं। खरीदारी शुरू करें!')}
                      </p>
                      <Link to={isFarmer ? '/farmer' : '/shop'} className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                        {isFarmer
                          ? (lang === 'en' ? 'Go to Dashboard' : 'डैशबोर्ड पर जाएं')
                          : (lang === 'en' ? 'Browse Products' : 'उत्पाद देखें')}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="profile-orders">
              <div className="profile-section">
                <h2 className="profile-section-title">
                  <Package size={20} /> {isFarmer ? (lang === 'en' ? 'Received Orders' : 'प्राप्त ऑर्डर') : (lang === 'en' ? 'Order History' : 'ऑर्डर इतिहास')}
                </h2>
                {loadingOrders ? (
                  <div className="activity-loading glass-card" style={{ padding: 40 }}>
                    <div className="spinner"></div>
                    <p>{lang === 'en' ? 'Loading orders...' : 'ऑर्डर लोड हो रहे हैं...'}</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="orders-list">
                    {orders.map((order, i) => (
                      <div key={i} className="order-card glass-card">
                        <div className="order-card-header">
                          <div>
                            <p className="order-card-id">#{order.id?.slice(0, 8)}</p>
                            <p className="order-card-date">
                              {new Date(order.created_at).toLocaleDateString(lang === 'en' ? 'en-IN' : 'hi-IN', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`status-badge status-${order.status || 'new'}`}>
                            {order.status || 'new'}
                          </span>
                        </div>
                        <div className="order-card-footer">
                          <span className="order-total">₹{order.total || 0}</span>
                          {isConsumer && (
                            <Link to="/tracking" className="btn btn-ghost btn-sm">
                              {lang === 'en' ? 'Track Order' : 'ऑर्डर ट्रैक करें'} <ChevronRight size={14} />
                            </Link>
                          )}
                          {isFarmer && (
                            <Link to="/farmer" className="btn btn-ghost btn-sm">
                              {lang === 'en' ? 'Manage' : 'प्रबंधित करें'} <ChevronRight size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="activity-empty glass-card" style={{ padding: 40 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>{isFarmer ? '🌾' : '🛒'}</div>
                    <p>{isFarmer
                      ? (lang === 'en' ? 'No orders received yet' : 'अभी तक कोई ऑर्डर प्राप्त नहीं हुआ')
                      : (lang === 'en' ? 'No orders found' : 'कोई ऑर्डर नहीं मिला')}</p>
                    <Link to={isFarmer ? '/farmer' : '/shop'} className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                      {isFarmer
                        ? (lang === 'en' ? 'Add Products' : 'उत्पाद जोड़ें')
                        : (lang === 'en' ? 'Start Shopping' : 'खरीदारी शुरू करें')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="profile-settings">
              <div className="profile-section">
                <h2 className="profile-section-title">
                  <Settings size={20} /> {lang === 'en' ? 'Account Settings' : 'खाता सेटिंग्स'}
                </h2>
                <div className="settings-list">
                  {[
                    { icon: <User size={18} />, label: lang === 'en' ? 'Personal Information' : 'व्यक्तिगत जानकारी', sub: lang === 'en' ? 'Name, email, phone' : 'नाम, ईमेल, फ़ोन', color: '#3B82F6' },
                    ...(isConsumer ? [
                      { icon: <MapPin size={18} />, label: lang === 'en' ? 'Saved Addresses' : 'सहेजे गए पते', sub: lang === 'en' ? 'Manage delivery addresses' : 'डिलीवरी पते प्रबंधित करें', color: '#10B981' },
                      { icon: <CreditCard size={18} />, label: lang === 'en' ? 'Payment Methods' : 'भुगतान विधियाँ', sub: lang === 'en' ? 'Manage cards & UPI' : 'कार्ड और UPI प्रबंधित करें', color: '#8B5CF6' },
                    ] : []),
                    ...(isFarmer ? [
                      { icon: <Sprout size={18} />, label: lang === 'en' ? 'Farm Details' : 'फ़ार्म विवरण', sub: lang === 'en' ? 'Location, certifications, type' : 'स्थान, प्रमाणपत्र, प्रकार', color: '#15803D' },
                      { icon: <CreditCard size={18} />, label: lang === 'en' ? 'Bank & Payouts' : 'बैंक और भुगतान', sub: lang === 'en' ? 'Bank account, withdrawal settings' : 'बैंक खाता, निकासी सेटिंग्स', color: '#8B5CF6' },
                    ] : []),
                    { icon: <Bell size={18} />, label: lang === 'en' ? 'Notifications' : 'सूचनाएं', sub: lang === 'en' ? 'Email, push, SMS preferences' : 'ईमेल, पुश, SMS प्राथमिकताएं', color: '#F59E0B' },
                    { icon: <Shield size={18} />, label: lang === 'en' ? 'Privacy & Security' : 'गोपनीयता और सुरक्षा', sub: lang === 'en' ? 'Password, 2FA, data' : 'पासवर्ड, 2FA, डेटा', color: '#EF4444' },
                  ].map((setting, i) => (
                    <button key={i} className="setting-item glass-card" id={`setting-${i}`}>
                      <div className="setting-icon" style={{ background: setting.color + '15', color: setting.color }}>
                        {setting.icon}
                      </div>
                      <div className="setting-info">
                        <p className="setting-label">{setting.label}</p>
                        <p className="setting-sub">{setting.sub}</p>
                      </div>
                      <ChevronRight size={18} className="setting-arrow" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="profile-section" style={{ marginTop: 32 }}>
                <h2 className="profile-section-title" style={{ color: '#DC2626' }}>
                  <Shield size={20} /> {lang === 'en' ? 'Danger Zone' : 'डेंजर ज़ोन'}
                </h2>
                <div className="glass-card" style={{ padding: 24, border: '1px solid #FCA5A5' }}>
                  <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {lang === 'en'
                      ? 'Once you delete your account, there is no going back. Please be certain.'
                      : 'एक बार खाता डिलीट करने के बाद, वापस नहीं जा सकते। कृपया सुनिश्चित करें।'}
                  </p>
                  <button className="btn btn-sm" id="delete-account-btn"
                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                    {lang === 'en' ? 'Delete Account' : 'खाता हटाएं'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
