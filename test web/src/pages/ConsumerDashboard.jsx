import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { products, farmers, quickFilters } from '../data/mockData';

function getHoursAgo(iso) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
}

const nearbyFarmsData = [
  { name: 'Green Valley Farm', dist: 2.5, products: 18, rating: 4.8, emoji: '🏡' },
  { name: 'Sunrise Organics', dist: 4.1, products: 12, rating: 4.6, emoji: '🌅' },
  { name: 'Pure Harvest Fields', dist: 6.3, products: 24, rating: 4.9, emoji: '🌾' },
];

export default function ConsumerDashboard() {
  const { t, lang, addToCart } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <main style={{ paddingBottom: 40 }}>
      <div className="container">
        {/* Quick Filters */}
        <div style={{ padding: '20px 0 0' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>{t('quickFilters')}</h2>
          <div className="filters-row">
            {quickFilters.map(f => (
              <button key={f.id} className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)} id={`filter-${f.id}`}>
                {lang === 'en' ? f.label : f.labelHi}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Products */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>🔥 {t('trendingNow')}</h2>
            <Link to="/shop" className="btn btn-ghost">{t('viewAll')} →</Link>
          </div>
          <div className="products-grid">
            {products.map((p, i) => {
              const farmer = farmers.find(f => f.id === p.farmerId);
              return (
                <Link to={`/product/${p.id}`} key={p.id} className={`product-card fade-in-up stagger-${(i % 5) + 1}`} id={`shop-product-${p.id}`}>
                  <div className="product-card-image">
                    <span className="emoji">{p.emoji}</span>
                    <span className="badge badge-green">{lang === 'en' ? p.badge : p.badgeHi}</span>
                  </div>
                  <div className="product-card-body">
                    <h3>{lang === 'en' ? p.name : p.nameHi}</h3>
                    <div className="farmer-name"><CheckCircle size={12} color="var(--green)" />{lang === 'en' ? farmer?.name : farmer?.nameHi}</div>
                    <div className="freshness-tag">{t('harvestedAgo').replace('{hours}', getHoursAgo(p.freshness))}</div>
                    <div className="price-row">
                      <span className="price">₹{p.price}<small style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}> {t('perUnit').replace('{unit}', p.unit)}</small></span>
                      <span className="market-price">₹{p.marketPrice}</span>
                    </div>
                    <button className="add-cart-btn" onClick={e => { e.preventDefault(); addToCart(p); }}>{t('addToCart')}</button>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Nearby Farms */}
        <section>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>📍 {t('nearbyFarms')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {nearbyFarmsData.map((farm, i) => (
              <div key={i} className={`glass-card fade-in-up stagger-${i + 1}`} style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: '2.5rem' }}>{farm.emoji}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{farm.name}</h3>
                  <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{farm.dist} {t('km')} • {farm.products} {t('products')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.85rem', color: 'var(--yellow)', fontWeight: 600, marginTop: 4 }}>
                    <Star size={14} fill="var(--yellow)" stroke="var(--yellow)" /> {farm.rating}
                  </div>
                </div>
                <Link to="/shop" className="btn btn-sm btn-primary">{t('visitFarm')}</Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
