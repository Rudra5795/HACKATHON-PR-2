import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ShoppingCart, Globe, LogIn, LogOut, User,
  Sprout, MoreVertical, Home, ShoppingBag, Package, CreditCard,
  Settings, HelpCircle, ChevronRight, X, LayoutDashboard,
  BarChart3, PlusCircle, Truck, Sun, Moon, Menu, MessageCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { t, toggleLang, cartCount, session, profile, signOut, lang, theme, toggleTheme, searchQuery, setSearchQuery, userLocation, detectLocation } = useApp();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
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
      items.push(
        { icon: <Sprout size={16} />, label: lang === 'en' ? 'My Farm Dashboard' : 'मेरा फ़ार्म डैशबोर्ड', to: '/farmer' },
        { icon: <PlusCircle size={16} />, label: lang === 'en' ? 'Add Product' : 'उत्पाद जोड़ें', to: '/farmer' },
        { icon: <BarChart3 size={16} />, label: lang === 'en' ? 'Earnings' : 'कमाई', to: '/farmer' },
      );
    } else if (session && isConsumer) {
      items.push(
        { icon: <ShoppingBag size={16} />, label: lang === 'en' ? 'Shop' : 'दुकान', to: '/shop' },
        { icon: <Package size={16} />, label: lang === 'en' ? 'Track Orders' : 'ऑर्डर ट्रैक करें', to: '/tracking' },
        { icon: <CreditCard size={16} />, label: lang === 'en' ? 'Checkout' : 'चेकआउट', to: '/checkout' },
      );
    } else {
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
      { to: '/chat', icon: <MessageCircle size={16} />, label: lang === 'en' ? 'Messages' : 'संदेश', id: 'dropdown-chat-link' },
      { to: '/profile', icon: <Settings size={16} />, label: lang === 'en' ? 'Settings' : 'सेटिंग्स', id: 'dropdown-settings-link' },
    );

    return links;
  };

  const kebabItems = getKebabItems();

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand"><span>🌿</span>{t('brand')}</Link>

          {/* Search bar — only show for consumers or non-logged-in users */}
          {(!session || isConsumer) && (
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder={t('searchPlaceholder')} id="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) navigate('/shop'); }}
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',padding:0,display:'flex'}}><X size={16} /></button>}
            </div>
          )}

          {/* Farmer search — different placeholder */}
          {session && isFarmer && (
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder={lang === 'en' ? 'Search your products...' : 'अपने उत्पाद खोजें...'} id="search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) navigate('/farmer'); }}
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',padding:0,display:'flex'}}><X size={16} /></button>}
            </div>
          )}

          <div className="nav-actions">
            {/* Location — only for consumers */}
            {(!session || isConsumer) && (
              <button className="location-btn" id="location-btn" onClick={detectLocation} title={userLocation.full || userLocation.label}>
                {userLocation.loading ? (
                  <><span className="spinner" style={{width:14,height:14,borderWidth:2,marginRight:4}} /> {lang === 'en' ? 'Detecting...' : 'खोज रहा…'}</>
                ) : (
                  <><MapPin size={14} />{userLocation.label}</>
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme} id="theme-toggle" aria-label="Toggle dark mode">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

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

                {/* Chat link */}
                <Link to="/chat" className="nav-chat-link" id="nav-chat-link">
                  <MessageCircle size={16} />
                </Link>

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

            {/* Mobile Hamburger */}
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu" id="mobile-menu-btn">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      {mobileOpen && <div className="mobile-menu-overlay open" onClick={() => setMobileOpen(false)} />}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <Link to="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>🌿 {t('brand')}</Link>
          <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {session && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 8, background: 'var(--green-light)', borderRadius: 'var(--radius-sm)' }}>
            <div className={`profile-avatar-circle ${isFarmer ? 'farmer' : 'consumer'}`} style={{ width: 36, height: 36, fontSize: '.75rem' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{userName}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{isFarmer ? '🌾 Farmer' : '🛒 Consumer'}</div>
            </div>
          </div>
        )}

        <div className="mobile-nav-links">
          <Link to="/" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
            <Home size={18} /> {lang === 'en' ? 'Home' : 'होम'}
          </Link>

          {session && isFarmer && (
            <>
              <Link to="/farmer" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <Sprout size={18} /> {lang === 'en' ? 'Farm Dashboard' : 'फ़ार्म डैशबोर्ड'}
              </Link>
              <Link to="/profile" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <User size={18} /> {lang === 'en' ? 'My Profile' : 'मेरा प्रोफ़ाइल'}
              </Link>
            </>
          )}

          {session && isConsumer && (
            <>
              <Link to="/shop" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <ShoppingBag size={18} /> {lang === 'en' ? 'Shop' : 'दुकान'}
              </Link>
              <Link to="/checkout" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <ShoppingCart size={18} /> {lang === 'en' ? 'Cart' : 'कार्ट'} {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/tracking" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <Package size={18} /> {lang === 'en' ? 'Track Orders' : 'ऑर्डर ट्रैक करें'}
              </Link>
              <Link to="/profile" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                <User size={18} /> {lang === 'en' ? 'My Profile' : 'मेरा प्रोफ़ाइल'}
              </Link>
            </>
          )}

          {!session && (
            <Link to="/auth" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
              <LogIn size={18} /> {lang === 'en' ? 'Login / Sign Up' : 'लॉगिन / साइन अप'}
            </Link>
          )}

          <div className="mobile-nav-divider" />

          <button className="mobile-nav-item" onClick={() => { toggleTheme(); }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? (lang === 'en' ? 'Light Mode' : 'लाइट मोड') : (lang === 'en' ? 'Dark Mode' : 'डार्क मोड')}
          </button>

          <button className="mobile-nav-item" onClick={() => { toggleLang(); }}>
            <Globe size={18} /> {lang === 'en' ? 'हिंदी' : 'English'}
          </button>

          <Link to="#" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
            <HelpCircle size={18} /> {lang === 'en' ? 'Help & Support' : 'मदद और सहायता'}
          </Link>

          {session && (
            <>
              <div className="mobile-nav-divider" />
              <button className="mobile-nav-item" onClick={handleSignOut} style={{ color: 'var(--danger)' }}>
                <LogOut size={18} /> {lang === 'en' ? 'Logout' : 'लॉगआउट'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
