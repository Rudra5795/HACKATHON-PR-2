import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">🌿 {t('brand')}</div>
            <p className="footer-tagline">{t('footerTagline')}</p>
          </div>
          <div>
            <h4>Links</h4>
            <ul>
              <li><Link to="/">{t('home')}</Link></li>
              <li><Link to="/shop">{t('shop')}</Link></li>
              <li><Link to="/farmer">{t('farmerDashboard')}</Link></li>
              <li><Link to="/about">{t('aboutUs')}</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">{t('contactUs')}</a></li>
              <li><a href="#">{t('faqs')}</a></li>
              <li><a href="#">{t('termsConditions')}</a></li>
              <li><a href="#">{t('privacyPolicy')}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">{t('madeWithLove')}</div>
      </div>
    </footer>
  );
}
