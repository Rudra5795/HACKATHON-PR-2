import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, CheckCircle, MessageCircle, MapPin, Clock, Package, Truck, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { orderSteps } from '../data/mockData';

export default function OrderTrackingPage() {
  const { t, lang, cart } = useApp();
  const activeStepIdx = orderSteps.findIndex(s => !s.done);
  const progress = ((activeStepIdx >= 0 ? activeStepIdx : orderSteps.length) / orderSteps.length) * 100;

  // Simulated order items for display
  const orderItems = cart.length > 0 ? cart : [
    { id: 1, name: 'Organic Tomatoes', nameHi: 'जैविक टमाटर', emoji: '🍅', qty: 2, price: 40 },
    { id: 2, name: 'Fresh Spinach', nameHi: 'ताज़ा पालक', emoji: '🥬', qty: 1, price: 30 },
  ];

  return (
    <main className="tracking-page">
      <div className="container">
        {/* ── Hero Status Card ── */}
        <div className="tracking-hero fade-in-up">
          <div className="tracking-hero-bg"></div>
          <div className="tracking-hero-content">
            <div className="tracking-status-icon">
              {activeStepIdx < 0 ? '✅' : activeStepIdx <= 1 ? '📦' : '🚴'}
            </div>
            <div className="tracking-status-info">
              <h1>{activeStepIdx < 0
                ? (lang === 'en' ? 'Delivered!' : 'डिलीवर हो गया!')
                : (lang === 'en' ? orderSteps[activeStepIdx]?.label : orderSteps[activeStepIdx]?.labelHi)
              }</h1>
              <p>{activeStepIdx < 0
                ? (lang === 'en' ? 'Your order has been delivered successfully' : 'आपका ऑर्डर सफलतापूर्वक डिलीवर हो गया है')
                : (lang === 'en' ? orderSteps[activeStepIdx]?.detail : orderSteps[activeStepIdx]?.detailHi)
              }</p>
            </div>
            <div className="tracking-order-badge">
              <span className="tracking-order-id">#{lang === 'en' ? 'ORD' : 'ORD'}-2841</span>
              <span className="tracking-eta">
                <Clock size={14} /> {t('estimatedDelivery')}: <strong>12:45 PM</strong>
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="tracking-progress-bar">
            <div className="tracking-progress-fill" style={{ width: `${progress}%` }}></div>
            <div className="tracking-progress-steps">
              {orderSteps.map((step, i) => (
                <div key={step.id} className={`progress-marker ${step.done ? 'done' : ''} ${i === activeStepIdx ? 'active' : ''}`}>
                  <span className="progress-marker-dot"></span>
                  <span className="progress-marker-label">{lang === 'en' ? step.label.split(' ').pop() : step.labelHi?.split(' ').pop()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tracking-grid">
          {/* ── Timeline ── */}
          <div className="tracking-timeline-card glass-card fade-in-up stagger-1">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '1.1rem', fontWeight: 600 }}>
              <Package size={20} /> {t('orderTracking')}
            </h2>
            <div className="timeline" id="order-timeline">
              {orderSteps.map((step, i) => (
                <div key={step.id} className={`timeline-step ${step.done ? 'done' : ''} ${i === activeStepIdx ? 'active' : ''}`}>
                  <div className="timeline-dot">
                    {step.done ? <CheckCircle size={14} /> : (i + 1)}
                  </div>
                  <div className="timeline-content">
                    <h3>{lang === 'en' ? step.label : step.labelHi}</h3>
                    <p>{lang === 'en' ? step.detail : step.detailHi}</p>
                    <div className="time">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div>
            {/* Delivery Partner */}
            <div className="delivery-card glass-card fade-in-up stagger-2" id="delivery-info" style={{ marginBottom: 16 }}>
              <div className="avatar">🚴</div>
              <div className="info">
                <h3>{t('deliveryPartner')}</h3>
                <p>Ravi Kumar • {lang === 'en' ? 'On the way' : 'रास्ते में'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '.8rem', fontWeight: 600 }}>4.9</span>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>(234 {lang === 'en' ? 'deliveries' : 'डिलीवरी'})</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary btn-sm" id="call-driver-btn">
                  <Phone size={14} /> {t('callDriver')}
                </button>
                <button className="btn btn-ghost btn-sm" id="chat-driver-btn">
                  <MessageCircle size={14} /> {lang === 'en' ? 'Chat' : 'चैट'}
                </button>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="glass-card fade-in-up stagger-3" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                🛒 {lang === 'en' ? 'Order Items' : 'ऑर्डर आइटम'}
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>{orderItems.length} {t('items')}</span>
              </h3>
              {orderItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: '.85rem' }}>{lang === 'en' ? item.name : item.nameHi}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>₹{item.price} × {item.qty}</p>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '.9rem' }}>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="glass-card fade-in-up stagger-4" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} /> {t('deliveryAddress')}
              </h3>
              <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                42, Green Park Colony, Sector 15<br />
                Gurugram, Haryana – 122001
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="tracking-actions fade-in-up stagger-4" style={{ marginTop: 28 }}>
          <Link to="/shop" className="btn btn-ghost">
            {lang === 'en' ? '← Continue Shopping' : '← खरीदारी जारी रखें'}
          </Link>
          <button className="btn btn-primary" id="rate-order-btn">
            <Star size={16} /> {lang === 'en' ? 'Rate Order' : 'ऑर्डर रेट करें'}
          </button>
        </div>
      </div>
    </main>
  );
}
