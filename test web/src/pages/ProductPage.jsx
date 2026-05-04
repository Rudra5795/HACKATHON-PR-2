import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { farmerAvatars } from '../data/mockData';

function getHoursAgo(iso) {
  return Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
}

const categoryEmoji = { Vegetables: '🥬', Fruits: '🍎', Dairy: '🥛', Grains: '🌾', Spices: '🌶️', Herbs: '🌿' };

export default function ProductPage() {
  const { id } = useParams();
  const { t, lang, addToCart } = useApp();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*, farmers(name, name_hi, location, location_hi, verified)')
      .eq('id', Number(id))
      .single()
      .then(({ data }) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main className="product-page">
      <div className="container" style={{ textAlign:'center', padding:'80px 20px' }}>
        <div style={{ fontSize:'3rem' }}>⏳</div>
        <p style={{ color:'var(--text-secondary)', marginTop:12 }}>{lang==='en' ? 'Loading...' : 'लोड हो रहा है...'}</p>
      </div>
    </main>
  );

  if (!product) return (
    <main className="product-page">
      <div className="container" style={{ textAlign:'center', padding:'80px 20px' }}>
        <h2>🚫 {lang==='en' ? 'Product not found' : 'उत्पाद नहीं मिला'}</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop:16 }}>{t('shopNow')}</Link>
      </div>
    </main>
  );

  const farmer   = product.farmers;
  const saving   = product.market_price - product.price;
  const savePct  = Math.round((saving / product.market_price) * 100);
  const superPrice = Math.round(product.market_price * 1.15);

  return (
    <main className="product-page">
      <div className="container">
        <div className="product-layout">
          <div className="product-image-box fade-in" id="product-image" style={product.image_url ? { padding: 0, overflow: 'hidden', background: '#F3F4F6' } : {}}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <span className="emoji">{product.emoji || categoryEmoji[product.category] || '🛒'}</span>
            )}
            <span className="badge badge-fresh" style={{ position:'absolute', top:20, left:20 }}>
              <Clock size={12} /> {t('harvestedAgo').replace('{hours}', getHoursAgo(product.freshness))}
            </span>
          </div>

          <div className="product-info fade-in-up">
            <h1>{lang==='en' ? product.name : product.name_hi}</h1>
            <div className="meta">
              <span className="badge badge-green">{lang==='en' ? product.badge : product.badge_hi}</span>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.9rem' }}>
                <Star size={14} fill="var(--yellow)" stroke="var(--yellow)" /> {product.rating} ({product.reviews} {t('reviews')})
              </span>
              <span className="badge badge-yellow">{t('inStock')}: {product.stock}</span>
            </div>

            <div className="price-block">
              <span className="current">₹{product.price}</span>
              <span className="original">₹{product.market_price}</span>
              <small style={{ color:'var(--text-secondary)' }}> {t('perUnit').replace('{unit}', product.unit)}</small>
              <br />
              <span className="saving">{t('youSave')}: ₹{saving} ({savePct}%)</span>
            </div>

            <p style={{ color:'var(--text-secondary)', lineHeight:1.7, marginBottom:24 }}>
              {lang==='en' ? product.description : product.description_hi}
            </p>

            <div className="farmer-info-card" id="farmer-info">
              <div className="avatar">
                {farmerAvatars[product.farmer_id]
                  ? <img src={farmerAvatars[product.farmer_id]} alt={farmer?.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : '👨‍🌾'}
              </div>
              <div className="details" style={{ flex:1 }}>
                <h3>{lang==='en' ? farmer?.name : farmer?.name_hi} {farmer?.verified && <CheckCircle size={14} color="var(--green)" style={{ verticalAlign:'middle' }} />}</h3>
                <p><MapPin size={12} style={{ verticalAlign:'middle' }} /> {lang==='en' ? farmer?.location : farmer?.location_hi}</p>
              </div>
              <Link to="/shop" className="btn btn-sm btn-secondary">{t('visitFarm')}</Link>
            </div>

            <div className="price-comparison">
              <h3>{t('pricingComparison')}</h3>
              {[
                { label: t('ourPrice'),    value: product.price,        pct: (product.price / superPrice)*100,        color:'var(--green)' },
                { label: t('avgMarket'),   value: product.market_price, pct: (product.market_price / superPrice)*100, color:'var(--yellow)' },
                { label: t('supermarket'), value: superPrice,           pct: 100,                                     color:'var(--danger)' },
              ].map(b => (
                <div className="price-bar" key={b.label}>
                  <span className="label">{b.label}</span>
                  <div className="bar"><div className="fill" style={{ width:b.pct+'%', background:b.color }}>₹{b.value}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky-cart" id="sticky-cart">
          <div>
            <div style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--green)' }}>₹{product.price}<small style={{ fontSize:'.8rem', fontWeight:400, color:'var(--text-secondary)' }}> {t('perUnit').replace('{unit}', product.unit)}</small></div>
            <div className="freshness-tag" style={{ marginBottom:0 }}>{t('harvestedAgo').replace('{hours}', getHoursAgo(product.freshness))}</div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => addToCart({ ...product, marketPrice:product.market_price, nameHi:product.name_hi })} id="add-to-cart-main">
            <ShoppingCart size={20} /> {t('addToCart')}
          </button>
        </div>
      </div>
    </main>
  );
}
