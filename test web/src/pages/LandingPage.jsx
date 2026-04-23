import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchProducts, fetchFarmers, fetchCategories } from '../lib/supabase';
import { images } from '../data/mockData';

function getHoursAgo(iso) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
}

function SkeletonCard() {
  return (
    <div className="product-card" style={{ pointerEvents: 'none' }}>
      <div className="product-card-image" style={{ background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 64, height: 64, background: '#E5E7EB', borderRadius: '50%' }} />
      </div>
      <div className="product-card-body">
        {[100, 70, 50, 80].map((w, i) => (
          <div key={i} style={{ height: 14, width: `${w}%`, background: '#E5E7EB', borderRadius: 6, marginBottom: 10 }} />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t, lang, addToCart } = useApp();
  const [products, setProducts]     = useState([]);
  const [farmers, setFarmers]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchFarmers(), fetchCategories()])
      .then(([prods, farms, cats]) => {
        setProducts(prods);
        setFarmers(farms);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = products.slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className="hero" id="hero-section">
        <div className="container">
          <div className="hero-content fade-in-up">
            <h1>{t('heroTagline')}<br /><span className="highlight">{t('heroHighlight')}</span></h1>
            <p>{t('heroSubtext')}</p>
            <div className="hero-buttons">
              <Link to="/shop" className="btn btn-primary btn-lg" id="shop-now-btn">{t('shopNow')} <ArrowRight size={18} /></Link>
              <Link to="/farmer" className="btn btn-secondary btn-lg" id="sell-btn">{t('sellProduce')}</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="num">500+</div><div className="label">{lang === 'en' ? 'Farmers' : 'किसान'}</div></div>
              <div className="hero-stat"><div className="num">10K+</div><div className="label">{lang === 'en' ? 'Customers' : 'ग्राहक'}</div></div>
              <div className="hero-stat"><div className="num">50+</div><div className="label">{lang === 'en' ? 'Cities' : 'शहर'}</div></div>
            </div>
          </div>
          <div className="hero-image fade-in">
            <img src={images.heroImg} alt="Fresh farm produce" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" id="featured-section">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2>{t('featuredProducts')}</h2>
            <p>{t('featuredSubtext')}</p>
          </div>
          <div className="products-grid">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : featured.map((p, i) => {
                  const farmer = p.farmers;
                  return (
                    <Link to={`/product/${p.id}`} key={p.id} className={`product-card fade-in-up stagger-${i + 1}`} id={`product-card-${p.id}`}>
                      <div className="product-card-image">
                        <span className="emoji">{p.emoji}</span>
                        <span className="badge badge-green">{lang === 'en' ? p.badge : p.badge_hi}</span>
                      </div>
                      <div className="product-card-body">
                        <h3>{lang === 'en' ? p.name : p.name_hi}</h3>
                        <div className="farmer-name"><CheckCircle size={12} color="var(--green)" />{lang === 'en' ? farmer?.name : farmer?.name_hi}</div>
                        <div className="freshness-tag">{t('harvestedAgo').replace('{hours}', getHoursAgo(p.freshness))}</div>
                        <div className="price-row">
                          <span className="price">₹{p.price}<small style={{fontSize:'.75rem',fontWeight:400,color:'var(--text-secondary)'}}> {t('perUnit').replace('{unit}', p.unit)}</small></span>
                          <span className="market-price">₹{p.market_price}</span>
                        </div>
                        <button className="add-cart-btn" onClick={e => { e.preventDefault(); addToCart({ ...p, marketPrice: p.market_price, nameHi: p.name_hi }); }} id={`add-cart-${p.id}`}>{t('addToCart')}</button>
                      </div>
                    </Link>
                  );
                })
            }
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ background: '#fff' }} id="categories-section">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2>{t('shopByCategory')}</h2>
            <p>{t('categorySubtext')}</p>
          </div>
          <div className="categories-grid">
            {(loading ? [] : categories).map((c, i) => (
              <Link to="/shop" key={c.id} className={`category-card fade-in-up stagger-${i + 1}`} style={{ background: c.color, color: c.accent }} id={`cat-${c.id}`}>
                <span className="icon">{c.icon}</span>
                <h3>{lang === 'en' ? c.name : c.name_hi}</h3>
                <span className="count">{c.count} {t('items')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Farmers */}
      <section className="section" id="farmers-section">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2>{t('topFarmers')}</h2>
            <p>{t('topFarmersSubtext')}</p>
          </div>
          <div className="farmers-grid">
            {(loading ? [] : farmers).slice(0, 4).map((f, i) => (
              <div key={f.id} className={`farmer-card fade-in-up stagger-${i + 1}`} id={`farmer-${f.id}`}>
                <div className="farmer-avatar">{f.image_url ? <img src={f.image_url} alt={f.name} /> : '👨‍🌾'}</div>
                <h3>{lang === 'en' ? f.name : f.name_hi}</h3>
                <div className="location"><span>📍</span>{lang === 'en' ? f.location : f.location_hi}</div>
                <div className="rating"><Star size={14} fill="var(--yellow)" stroke="var(--yellow)" /> {f.rating} ({f.reviews})</div>
                {f.verified && <span className="badge badge-green" style={{ marginTop: 8 }}>✓ {t('verified')}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
