import { Link } from 'react-router-dom';
import { Search, MapPin, ShoppingCart, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { t, toggleLang, cartCount } = useApp();
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
