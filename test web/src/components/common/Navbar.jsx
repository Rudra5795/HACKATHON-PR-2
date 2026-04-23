import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ShoppingCart, Globe, LogIn, LogOut, User, Sprout } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { t, toggleLang, cartCount, session, profile, signOut, lang } = useApp();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand"><span>🌿</span>{t('brand')}</Link>

        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder={t('searchPlaceholder')} id="search-input" />
        </div>

        <div className="nav-actions">
          <button className="location-btn" id="location-btn"><MapPin size={14} />{t('location')}</button>
          <button className="lang-toggle" onClick={toggleLang} id="lang-toggle"><Globe size={14} /> {t('language')}</button>

          {session ? (
            <>
              {/* Farmer dashboard link */}
              {profile?.role === 'farmer' && (
                <Link to="/farmer"
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'var(--green-light)', color:'var(--green)', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:'.875rem', textDecoration:'none' }}
                  id="farmer-dash-link">
                  <Sprout size={16} />
                  {lang === 'en' ? 'My Farm' : 'मेरा फ़ार्म'}
                </Link>
              )}

              {/* User greeting */}
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.875rem', color:'var(--text-secondary)', fontWeight:500 }}>
                <User size={15} />
                <span style={{ maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {profile?.full_name?.split(' ')[0] || 'User'}
                </span>
              </div>

              {/* Logout */}
              <button onClick={handleSignOut} id="logout-btn"
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#FEF2F2', color:'#DC2626', border:'none', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:'.875rem', cursor:'pointer' }}>
                <LogOut size={15} />
                {lang === 'en' ? 'Logout' : 'लॉगआउट'}
              </button>
            </>
          ) : (
            <Link to="/auth"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--green)', color:'#fff', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:'.875rem', textDecoration:'none' }}
              id="login-btn">
              <LogIn size={15} />
              {lang === 'en' ? 'Login' : 'लॉगिन'}
            </Link>
          )}

          <Link to="/checkout" className="cart-btn" id="cart-btn">
            <ShoppingCart size={18} />
            {t('cart')}
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
