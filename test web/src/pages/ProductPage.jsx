import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { products, farmers } from '../data/mockData';

function getHoursAgo(iso) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
}

export default function ProductPage() {
  const { id } = useParams();
  const { t, lang, addToCart } = useApp();
  const product = products.find(p => p.id === Number(id)) || products[0];
  const farmer = farmers.find(f => f.id === product.farmerId);
  const saving = product.marketPrice - product.price;
  const savePct = Math.round((saving / product.marketPrice) * 100);
  const superPrice = Math.round(product.marketPrice * 1.15);

  return (
    <main className="product-page">
      <div className="container">
        <div className="product-layout">
          <div className="product-image-box fade-in" id="product-image">
            <span className="emoji">{product.emoji}</span>
            <span className="badge badge-fresh" style={{ position: 'absolute', top: 20, left: 20 }}>
              <Clock size={12} /> {t('harvestedAgo').replace('{hours}', getHoursAgo(product.freshness))}
            </span>
          </div>

          <div className="product-info fade-in-up">
            <h1>{lang === 'en' ? product.name : product.nameHi}</h1>
            <div className="meta">
              <span className="badge badge-green">{lang === 'en' ? product.badge : product.badgeHi}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.9rem' }}>
                <Star size={14} fill="var(--yellow)" stroke="var(--yellow)" /> {product.rating} ({product.reviews} {t('reviews')})
              </span>
              <span className="badge badge-yellow">{t('inStock')}: {product.stock}</span>
            </div>

            <div className="price-block">
              <span className="current">₹{product.price}</span>
              <span className="original">₹{product.marketPrice}</span>
              <small style={{ color: 'var(--text-secondary)' }}> {t('perUnit').replace('{unit}', product.unit)}</small>
              <br />
              <span className="saving">{t('youSave')}: ₹{saving} ({savePct}%)</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              {lang === 'en' ? product.description : product.descriptionHi}
            </p>

            <div className="farmer-info-card" id="farmer-info">
              <div className="avatar">👨‍🌾</div>
              <div className="details" style={{ flex: 1 }}>
                <h3>{lang === 'en' ? farmer?.name : farmer?.nameHi} {farmer?.verified && <CheckCircle size={14} color="var(--green)" style={{ verticalAlign: 'middle' }} />}</h3>
                <p><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {lang === 'en' ? farmer?.location : farmer?.locationHi}</p>
              </div>
              <Link to="/shop" className="btn btn-sm btn-secondary">{t('visitFarm')}</Link>
            </div>

            <div className="price-comparison">
              <h3>{t('pricingComparison')}</h3>
              {[
                { label: t('ourPrice'), value: product.price, pct: (product.price / superPrice) * 100, color: 'var(--green)' },
                { label: t('avgMarket'), value: product.marketPrice, pct: (product.marketPrice / superPrice) * 100, color: 'var(--yellow)' },
                { label: t('supermarket'), value: superPrice, pct: 100, color: 'var(--danger)' },
              ].map(b => (
                <div className="price-bar" key={b.label}>
                  <span className="label">{b.label}</span>
                  <div className="bar"><div className="fill" style={{ width: b.pct + '%', background: b.color }}>₹{b.value}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky-cart" id="sticky-cart">
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>₹{product.price}<small style={{ fontSize: '.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}> {t('perUnit').replace('{unit}', product.unit)}</small></div>
            <div className="freshness-tag" style={{ marginBottom: 0 }}>{t('harvestedAgo').replace('{hours}', getHoursAgo(product.freshness))}</div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => addToCart(product)} id="add-to-cart-main">
            <ShoppingCart size={20} /> {t('addToCart')}
          </button>
        </div>
      </div>
    </main>
  );
}
