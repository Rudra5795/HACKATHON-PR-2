import { useState } from 'react';
import { Plus, Package, IndianRupee, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { farmerOrders, earningsData } from '../data/mockData';

export default function FarmerDashboard() {
  const { t, lang } = useApp();
  const [period, setPeriod] = useState('today');
  const earningsMap = { today: earningsData.today, week: earningsData.week, month: earningsData.month };

  return (
    <main className="farmer-dash">
      <div className="container">
        <div className="farmer-welcome fade-in-up" id="farmer-welcome">
          <h1>{t('welcomeBack')}, Ramesh! 👋</h1>
          <p>{lang === 'en' ? 'Here\'s your farm overview for today' : 'आज का आपका फ़ार्म अवलोकन'}</p>
        </div>

        <div className="farmer-actions">
          <button className="farmer-action-btn fade-in-up stagger-1" id="add-product-btn" style={{ color: 'var(--green)' }}>
            <Plus size={48} />
            {t('addProduct')}
          </button>
          <button className="farmer-action-btn fade-in-up stagger-2" id="view-orders-btn" style={{ color: 'var(--yellow)' }}>
            <Package size={48} />
            {t('viewOrders')}
          </button>
          <button className="farmer-action-btn fade-in-up stagger-3" id="earnings-btn" style={{ color: '#8B5CF6' }}>
            <IndianRupee size={48} />
            {t('earnings')}
          </button>
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={20} /> {t('earnings')}
        </h2>
        <div className="earnings-grid fade-in-up">
          {[
            { key: 'today', label: t('todayEarnings'), val: earningsData.today },
            { key: 'week', label: t('weekEarnings'), val: earningsData.week },
            { key: 'month', label: t('monthEarnings'), val: earningsData.month },
            { key: 'pending', label: t('pendingAmount'), val: earningsData.pending },
          ].map(e => (
            <div key={e.key} className="earnings-card">
              <div className="amount" style={e.key === 'pending' ? { color: 'var(--yellow)' } : {}}>₹{e.val.toLocaleString()}</div>
              <div className="label">{e.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={20} /> {t('recentOrders')}
        </h2>
        <table className="orders-table fade-in-up" id="orders-table">
          <thead>
            <tr>
              <th>{t('orderId')}</th>
              <th>{lang === 'en' ? 'Customer' : 'ग्राहक'}</th>
              <th>{t('items')}</th>
              <th>{t('total')}</th>
              <th>{t('orderStatus')}</th>
              <th>{lang === 'en' ? 'Time' : 'समय'}</th>
            </tr>
          </thead>
          <tbody>
            {farmerOrders.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.items}</td>
                <td>₹{o.total}</td>
                <td><span className={`status-badge status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
