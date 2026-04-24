import { Phone, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { orderSteps, images } from '../data/mockData';

export default function OrderTrackingPage() {
  const { t, lang } = useApp();
  return (
    <main className="tracking-page">
      <div className="container">
        <div className="tracking-header fade-in-up">
          <h1>{t('orderTracking')}</h1>
          <p>{t('orderId')}: <span className="order-id">#ORD-2841</span></p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginTop: 4 }}>
            {t('estimatedDelivery')}: <strong>12:45 PM</strong>
          </p>
        </div>

        <div className="glass-card fade-in-up" style={{ padding: 32, marginBottom: 24 }}>
          <div className="timeline" id="order-timeline">
            {orderSteps.map((step, i) => (
              <div key={step.id} className={`timeline-step ${step.done ? 'done' : ''} ${!step.done && i === orderSteps.findIndex(s => !s.done) ? 'active' : ''}`}>
                <div className="timeline-dot">
                  {step.done ? <CheckCircle size={16} /> : (i + 1)}
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

        <div className="delivery-card fade-in-up stagger-2" id="delivery-info">
          <div className="avatar">🚴</div>
          <div className="info">
            <h3>{t('deliveryPartner')}</h3>
            <p>Ravi Kumar • {lang === 'en' ? 'On the way' : 'रास्ते में'}</p>
          </div>
          <button className="btn btn-primary btn-sm" id="call-driver-btn">
            <Phone size={16} /> {t('callDriver')}
          </button>
        </div>

        <div className="fade-in-up stagger-3" style={{ textAlign: 'center', marginTop: 32 }}>
          <img src={images.deliveryImg} alt="Delivery" style={{ maxWidth: 240, margin: '0 auto', borderRadius: 'var(--radius)' }} />
        </div>
      </div>
    </main>
  );
}
