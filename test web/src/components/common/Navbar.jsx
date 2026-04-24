import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ShoppingCart, Globe, LogIn, LogOut, User,
  Sprout, MoreVertical, Home, ShoppingBag, Package, CreditCard,
  Settings, HelpCircle, ChevronRight, X, LayoutDashboard,
  BarChart3, PlusCircle, Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { t, toggleLang, cartCount, session, profile, signOut, lang } = useApp();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);

  const profileRef = useRef(null);
  const kebabRef = useRef(null);

  // Click-outside handler
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        setKebabOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await signOut();
    navigate('/');
  };

  const userName = profile?.full_name || 'User';
  const userEmail = session?.user?.email || '';
  const userRole = profile?.role || 'consumer';
  const isFarmer = userRole === 'farmer';
  const isConsumer = userRole === 'consumer';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // ── Kebab menu items — role-specific ────────────────────────────────────────
  const getKebabItems = () => {
    const items = [
      { icon: <Home size={16} />, label: lang === 'en' ? 'Home' : 'होम', to: '/' },
    ];

    if (session && isFarmer) {
      // Farmer-only kebab items
      items.push(
        { icon: <Sprout size={16} />, label: lang === 'en' ? 'My Farm Dashboard' : 'मेरा फ़ार्म डैशबोर्ड', to: '/farmer' },
        { icon: <PlusCircle size={16} />, label: lang === 'en' ? 'Add Product' : 'उत्पाद जोड़ें', to: '/farmer' },
        { icon: <BarChart3 size={16} />, label: lang === 'en' ? 'Earnings' : 'कमाई', to: '/farmer' },
      );
    } else if (session && isConsumer) {
      // Consumer-only kebab items
      items.push(
        { icon: <ShoppingBag size={16} />, label: lang === 'en' ? 'Shop' : 'दुकान', to: '/shop' },
        { icon: <Package size={16} />, label: lang === 'en' ? 'Track Orders' : 'ऑर्डर ट्रैक करें', to: '/tracking' },
        { icon: <CreditCard size={16} />, label: lang === 'en' ? 'Checkout' : 'चेकआउट', to: '/checkout' },
      );
    } else {
      // Not logged in — show general items
      items.push(
        { icon: <ShoppingBag size={16} />, label: lang === 'en' ? 'Shop' : 'दुकान', to: '/auth' },
        { icon: <Sprout size={16} />, label: lang === 'en' ? 'Sell Produce' : 'उपज बेचें', to: '/auth' },
      );
    }

    if (session) {
      items.push(
        { icon: <LayoutDashboard size={16} />, label: lang === 'en' ? 'My Profile' : 'मेरा प्रोफ़ाइल', to: '/profile' },
      );
    }

    items.push(
      { divider: true },
      { icon: <HelpCircle size={16} />, label: lang === 'en' ? 'Help & Support' : 'मदद और सहायता', to: '#' },
    );

    return items;
  };

  // ── Profile dropdown links — role-specific ──────────────────────────────────
  const getProfileLinks = () => {
    const links = [
      { to: '/profile', icon: <User size={16} />, label: lang === 'en' ? 'My Profile' : 'मेरा प्रोफ़ाइल', id: 'dropdown-profile-link' },
    ];

    if (isFarmer) {
      links.push(
        { to: '/farmer', icon: <Sprout size={16} />, label: lang === 'en' ? 'Farm Dashboard' : 'फ़ार्म डैशबोर्ड', id: 'dropdown-farm-link' },
        { to: '/farmer', icon: <BarChart3 size={16} />, label: lang === 'en' ? 'Earnings' : 'कमाई', id: 'dropdown-earnings-link' },
      );
    } else {
      links.push(
        { to: '/tracking', icon: <Package size={16} />, label: lang === 'en' ? 'My Orders' : 'मेरे ऑर्डर', id: 'dropdown-orders-link' },
        { to: '/shop', icon: <ShoppingBag size={16} />, label: lang === 'en' ? 'Browse Shop' : 'दुकान देखें', id: 'dropdown-shop-link' },
      );
    }

    links.push(
      { to: '/profile', icon: <Settings size={16} />, label: lang === 'en' ? 'Settings' : 'सेटिंग्स', id: 'dropdown-settings-link' },
    );

    return links;
  };

  const kebabItems = getKebabItems();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand"><span>🌿</span>{t('brand')}</Link>

        {/* Search bar — only show for consumers or non-logged-in users */}
        {(!session || isConsumer) && (
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder={t('searchPlaceholder')} id="search-input" />
          </div>
        )}

        {/* Farmer search — different placeholder */}
        {session && isFarmer && (
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder={lang === 'en' ? 'Search your products...' : 'अपने उत्पाद खोजें...'} id="search-input" />
          </div>
        )}

        <div className="nav-actions">
          {/* Location — only for consumers */}
          {(!session || isConsumer) && (
            <button className="location-btn" id="location-btn"><MapPin size={14} />{t('location')}</button>
          )}
          <button className="lang-toggle" onClick={toggleLang} id="lang-toggle"><Globe size={14} /> {t('language')}</button>

          {session ? (
            <>
              {/* Role-specific quick link in navbar */}
              {isFarmer ? (
                <Link to="/farmer" className="nav-farmer-link" id="farmer-dash-link">
                  <Sprout size={16} />
                  {lang === 'en' ? 'My Farm' : 'मेरा फ़ार्म'}
                </Link>
              ) : (
                <Link to="/shop" className="nav-consumer-link" id="shop-link">
                  <ShoppingBag size={16} />
                  {lang === 'en' ? 'Shop' : 'दुकान'}
                </Link>
              )}

              {/* Profile Avatar Button */}
              <div className="profile-dropdown-wrapper" ref={profileRef}>
                <button
                  className="profile-avatar-btn"
                  onClick={() => { setProfileOpen(!profileOpen); setKebabOpen(false); }}
                  id="profile-avatar-btn"
                  aria-label="Profile menu"
                >
                  <div className={`profile-avatar-circle ${isFarmer ? 'farmer' : 'consumer'}`}>
                    <span>{initials}</span>
                  </div>
                  <div className="profile-avatar-status"></div>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="profile-dropdown" id="profile-dropdown">
                    <div className={`profile-dropdown-header ${isFarmer ? 'farmer' : 'consumer'}`}>
                      <div className={`profile-dropdown-avatar ${isFarmer ? 'farmer' : ''}`}>
                        <span>{initials}</span>
                      </div>
                      <div className="profile-dropdown-info">
                        <p className="profile-dropdown-name">{userName}</p>
                        <p className="profile-dropdown-email">{userEmail}</p>
                        <span className={`profile-dropdown-role ${isFarmer ? 'farmer' : ''}`}>
                          {isFarmer ? '🌾' : '🛒'} {isFarmer ? (lang === 'en' ? 'Farmer' : 'किसान') : (lang === 'en' ? 'Consumer' : 'ग्राहक')}
                        </span>
                      </div>
                    </div>

                    <div className="profile-dropdown-links">
                      {getProfileLinks().map(link => (
                        <Link key={link.id} to={link.to} className="profile-dropdown-item" onClick={() => setProfileOpen(false)} id={link.id}>
                          {link.icon}
                          <span>{link.label}</span>
                          <ChevronRight size={14} className="dropdown-arrow" />
                        </Link>
                      ))}
                    </div>

                    <div className="profile-dropdown-footer">
                      <button onClick={handleSignOut} className="profile-dropdown-logout" id="dropdown-logout-btn">
                        <LogOut size={16} />
                        <span>{lang === 'en' ? 'Logout' : 'लॉगआउट'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="nav-login-btn" id="login-btn">
              <LogIn size={15} />
              {lang === 'en' ? 'Login' : 'लॉगिन'}
            </Link>
          )}

          {/* Cart — only visible for consumers */}
          {(!session || isConsumer) && (
            <Link to={session ? '/checkout' : '/auth'} className="cart-btn" id="cart-btn">
              <ShoppingCart size={18} />
              {t('cart')}
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          )}

          {/* 3-Dot Kebab Menu */}
          <div className="kebab-wrapper" ref={kebabRef}>
            <button
              className="kebab-btn"
              onClick={() => { setKebabOpen(!kebabOpen); setProfileOpen(false); }}
              id="kebab-menu-btn"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>

            {kebabOpen && (
              <div className="kebab-menu" id="kebab-menu">
                <div className="kebab-menu-header">
                  <span>
                    {session
                      ? (isFarmer
                          ? (lang === 'en' ? '🌾 Farmer Menu' : '🌾 किसान मेनू')
                          : (lang === 'en' ? '🛒 Consumer Menu' : '🛒 ग्राहक मेनू'))
                      : (lang === 'en' ? 'Quick Menu' : 'क्विक मेनू')
                    }
                  </span>
                  <button onClick={() => setKebabOpen(false)} className="kebab-close" aria-label="Close menu">
                    <X size={16} />
                  </button>
                </div>
                {kebabItems.map((item, i) =>
                  item.divider ? (
                    <div key={i} className="kebab-divider"></div>
                  ) : (
                    <Link
                      key={i}
                      to={item.to}
                      className="kebab-item"
                      onClick={() => setKebabOpen(false)}
                      id={`kebab-item-${i}`}
                    >
                      <span className="kebab-item-icon">{item.icon}</span>
                      <span className="kebab-item-label">{item.label}</span>
                      <ChevronRight size={14} className="kebab-item-arrow" />
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
