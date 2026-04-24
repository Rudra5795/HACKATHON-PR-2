import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, IndianRupee, TrendingUp, X, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices', 'Herbs'];
const UNITS       = ['kg', 'bunch', 'dozen', 'litre', '250g', '500g', 'piece'];
const BADGES      = ['Organic', 'Fresh', 'Premium', 'Homemade', 'Farm Fresh', 'Himalayan', 'Aromatic', 'Spicy', 'Staple'];
const EMOJIS      = ['🍅','🥬','🥭','🍚','🥛','🥕','🌾','🧀','🧅','🌶️','🌿','🍎','🍋','🥦','🫛','🥑','🧄','🫚'];

const FALLBACK_EARNINGS = { today: 0, this_week: 0, this_month: 0, pending: 0 };

export default function FarmerDashboard() {
  const { t, lang, session, profile, farmerProfile, setFarmerProfile } = useApp();
  const navigate = useNavigate();

  const [earnings, setEarnings]     = useState(null);
  const [orders, setOrders]         = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add-product form state
  const [form, setForm] = useState({
    name: '', name_hi: '', category: 'Vegetables', price: '', market_price: '',
    unit: 'kg', badge: 'Fresh', badge_hi: '', stock: '', emoji: '🥬',
    description: '', description_hi: '',
  });

  // ── Redirect if not a logged-in farmer ──────────────────────────────────
  useEffect(() => {
    if (!session) { navigate('/auth'); return; }
    if (profile && profile.role !== 'farmer') { navigate('/shop'); return; }
  }, [session, profile]);

  // ── Load data when farmerProfile is ready ───────────────────────────────
  useEffect(() => {
    if (!farmerProfile?.id) return;
    loadDashboard(farmerProfile.id);

    // Realtime – new orders
    const ch = supabase.channel('farmer-orders-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `farmer_id=eq.${farmerProfile.id}` },
        () => loadOrders(farmerProfile.id))
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [farmerProfile]);

  const loadDashboard = async (fid) => {
    setDataLoading(true);
    await Promise.all([loadEarnings(fid), loadOrders(fid), loadMyProducts(fid)]);
    setDataLoading(false);
  };

  const loadEarnings = async (fid) => {
    const { data, error } = await supabase.from('earnings').select('*').eq('farmer_id', fid).single();
    setEarnings(error ? FALLBACK_EARNINGS : data);
  };

  const loadOrders = async (fid) => {
    const { data } = await supabase.from('orders')
      .select('id, status, placed_at, subtotal, order_items(qty, name)')
      .eq('farmer_id', fid)
      .order('placed_at', { ascending: false })
      .limit(15);
    setOrders(data || []);
  };

  const loadMyProducts = async (fid) => {
    const { data } = await supabase.from('products')
      .select('id, name, price, stock, is_active, emoji, category, badge')
      .eq('farmer_id', fid)
      .order('id', { ascending: false });
    setMyProducts(data || []);
  };

  // ── Add product ──────────────────────────────────────────────────────────
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError(''); setSuccessMsg('');
    if (!form.name || !form.price || !form.stock) { setFormError('Name, price, and stock are required.'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('products').insert({
        name:           form.name,
        name_hi:        form.name_hi || form.name,
        category:       form.category,
        price:          Number(form.price),
        market_price:   Number(form.market_price) || Math.round(Number(form.price) * 1.4),
        unit:           form.unit,
        farmer_id:      farmerProfile.id,
        freshness:      new Date().toISOString(),
        badge:          form.badge,
        badge_hi:       form.badge_hi || form.badge,
        stock:          Number(form.stock),
        description:    form.description,
        description_hi: form.description_hi || form.description,
        emoji:          form.emoji,
        is_active:      true,
      }).select().single();

      if (error) throw error;

      setMyProducts(prev => [data, ...prev]);
      setSuccessMsg(lang === 'en' ? `✅ "${data.name}" listed in shop!` : `✅ "${data.name}" दुकान में जोड़ा!`);
      setShowAddForm(false);
      setForm({ name:'', name_hi:'', category:'Vegetables', price:'', market_price:'', unit:'kg', badge:'Fresh', badge_hi:'', stock:'', emoji:'🥬', description:'', description_hi:'' });

      // Update farmer products count
      await supabase.from('farmers').update({ products: myProducts.length + 1 }).eq('id', farmerProfile.id);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleProductStatus = async (productId, current) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', productId);
    setMyProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: !current } : p));
  };

  const timeAgo = (iso) => {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  };

  const itemCount = (order) => order.order_items?.reduce((s, i) => s + i.qty, 0) ?? 0;

  if (!session || (profile && profile.role !== 'farmer')) return null;

  return (
    <main className="farmer-dash">
      <div className="container">

        {/* Welcome */}
        <div className="farmer-welcome fade-in-up" id="farmer-welcome">
          <h1>{t('welcomeBack')}, {profile?.full_name?.split(' ')[0] || 'Farmer'}! 👋</h1>
          <p>{lang === 'en' ? "Here's your farm overview for today" : 'आज का आपका फ़ार्म अवलोकन'}</p>
        </div>

        {/* Success message */}
        {successMsg && (
          <div style={{ padding:'14px 18px', background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'var(--radius-sm)', color:'#16A34A', fontWeight:600, marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {successMsg}
            <button onClick={() => setSuccessMsg('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#16A34A' }}><X size={16} /></button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="farmer-actions">
          <button className="farmer-action-btn fade-in-up stagger-1" id="add-product-btn"
            style={{ color:'var(--green)' }} onClick={() => setShowAddForm(true)}>
            <Plus size={48} />{t('addProduct')}
          </button>
          <button className="farmer-action-btn fade-in-up stagger-2" id="view-orders-btn" style={{ color:'var(--yellow)' }}>
            <Package size={48} />{t('viewOrders')}
            {orders.length > 0 && <span className="badge badge-green" style={{ fontSize:'.7rem', marginTop:4 }}>{orders.length}</span>}
          </button>
          <button className="farmer-action-btn fade-in-up stagger-3" id="earnings-btn" style={{ color:'#8B5CF6' }}>
            <IndianRupee size={48} />{t('earnings')}
          </button>
        </div>

        {/* Earnings */}
        <h2 style={{ fontSize:'1.3rem', fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
          <TrendingUp size={20} /> {t('earnings')}
        </h2>
        {dataLoading ? (
          <div style={{ textAlign:'center', padding:'24px', color:'var(--text-secondary)' }}>⏳</div>
        ) : (
          <div className="earnings-grid fade-in-up">
            {[
              { key:'today',   label: t('todayEarnings'),  val: earnings?.today      || 0, yellow: false },
              { key:'week',    label: t('weekEarnings'),    val: earnings?.this_week  || 0, yellow: false },
              { key:'month',   label: t('monthEarnings'),   val: earnings?.this_month || 0, yellow: false },
              { key:'pending', label: t('pendingAmount'),   val: earnings?.pending    || 0, yellow: true  },
            ].map(e => (
              <div key={e.key} className="earnings-card">
                <div className="amount" style={e.yellow ? { color:'var(--yellow)' } : {}}>₹{Number(e.val).toLocaleString()}</div>
                <div className="label">{e.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* My Products */}
        <h2 style={{ fontSize:'1.3rem', fontWeight:700, margin:'32px 0 16px', display:'flex', alignItems:'center', gap:8 }}>
          🛒 {lang === 'en' ? 'My Listed Products' : 'मेरे लिस्टेड उत्पाद'}
          <span style={{ fontSize:'.8rem', fontWeight:500, color:'var(--text-secondary)' }}>({myProducts.length})</span>
        </h2>
        {dataLoading ? <div style={{ textAlign:'center', color:'var(--text-secondary)' }}>⏳</div> : myProducts.length === 0 ? (
          <div style={{ textAlign:'center', padding:32, background:'#fff', borderRadius:'var(--radius)', border:'1px solid #E5E7EB', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🌱</div>
            <p>{lang === 'en' ? 'No products yet. Click "Add Product" to list your first item!' : 'अभी कोई उत्पाद नहीं। पहला उत्पाद जोड़ें!'}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16, marginBottom:32 }}>
            {myProducts.map(p => (
              <div key={p.id} className="glass-card" style={{ padding:18, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:'2rem' }}>{p.emoji || '🛒'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:'.95rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize:'.8rem', color:'var(--text-secondary)' }}>{p.category} • ₹{p.price}</div>
                  <div style={{ fontSize:'.78rem', marginTop:2 }}>
                    <span className={`status-badge status-${p.is_active ? 'delivered' : 'cancelled'}`} style={{ fontSize:'.72rem' }}>
                      {p.is_active ? (lang === 'en' ? '● Live in shop' : '● दुकान में') : (lang === 'en' ? '○ Hidden' : '○ छिपा')}
                    </span>
                  </div>
                </div>
                <button onClick={() => toggleProductStatus(p.id, p.is_active)}
                  style={{ padding:'6px 10px', fontSize:'.75rem', fontWeight:600, border:'1.5px solid', borderColor: p.is_active ? '#FCA5A5' : '#86EFAC', background: p.is_active ? '#FEF2F2' : '#F0FDF4', color: p.is_active ? '#DC2626' : '#16A34A', borderRadius:'var(--radius-sm)', cursor:'pointer', whiteSpace:'nowrap' }}>
                  {p.is_active ? (lang === 'en' ? 'Hide' : 'छिपाएं') : (lang === 'en' ? 'Show' : 'दिखाएं')}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recent Orders */}
        <h2 style={{ fontSize:'1.3rem', fontWeight:700, margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
          <Package size={20} /> {t('recentOrders')}
          <span style={{ fontSize:'.75rem', color:'var(--green)', fontWeight:500 }}>{lang === 'en' ? '(realtime)' : '(रियल-टाइम)'}</span>
        </h2>
        {orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:40, background:'#fff', borderRadius:'var(--radius)', border:'1px solid #E5E7EB', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📦</div>
            <p>{lang === 'en' ? 'No orders yet — they will appear here in real-time!' : 'अभी कोई ऑर्डर नहीं — वे यहाँ रियल-टाइम में दिखेंगे!'}</p>
          </div>
        ) : (
          <table className="orders-table fade-in-up" id="orders-table">
            <thead>
              <tr>
                <th>{t('orderId')}</th>
                <th>{t('items')}</th>
                <th>{t('total')}</th>
                <th>{t('orderStatus')}</th>
                <th>{lang === 'en' ? 'Time' : 'समय'}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight:600, fontFamily:'monospace', fontSize:'.85rem' }}>{o.id.slice(0,8).toUpperCase()}</td>
                  <td>{itemCount(o)}</td>
                  <td>₹{o.subtotal}</td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'.85rem' }}>{timeAgo(o.placed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Add Product Modal ─────────────────────────────────────────────── */}
      {showAddForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddForm(false); }}>
          <div style={{ background:'#fff', borderRadius:'var(--radius)', width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto', padding:32 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <h2 style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--green)' }}>
                🌱 {lang === 'en' ? 'Add New Product' : 'नया उत्पाद जोड़ें'}
              </h2>
              <button onClick={() => setShowAddForm(false)} style={{ background:'#F3F4F6', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div style={{ padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'var(--radius-sm)', color:'#DC2626', fontSize:'.85rem', marginBottom:16 }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleAddProduct} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Emoji picker */}
              <div>
                <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:6, display:'block' }}>
                  {lang === 'en' ? 'Pick an Emoji' : 'इमोजी चुनें'}
                </label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(f => ({ ...f, emoji: em }))}
                      style={{ fontSize:'1.4rem', background: form.emoji === em ? 'var(--green-light)' : '#F9FAFB', border: form.emoji === em ? '2px solid var(--green)' : '2px solid transparent', borderRadius:8, padding:'4px 6px', cursor:'pointer' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row: name + name_hi */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:4, display:'block' }}>Name (English) *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Organic Tomatoes"
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:'var(--radius-sm)', fontSize:'.9rem', boxSizing:'border-box', fontFamily:'inherit' }} />
                </div>
                <div>
                  <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:4, display:'block' }}>नाम (हिंदी)</label>
                  <input value={form.name_hi} onChange={e => setForm(f => ({ ...f, name_hi: e.target.value }))} placeholder="जैविक टमाटर"
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:'var(--radius-sm)', fontSize:'.9rem', boxSizing:'border-box', fontFamily:'inherit' }} />
                </div>
              </div>

              {/* Row: category + unit */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:4, display:'block' }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:'var(--radius-sm)', fontSize:'.9rem', boxSizing:'border-box', fontFamily:'inherit', background:'#fff' }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:4, display:'block' }}>Unit</label>
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:'var(--radius-sm)', fontSize:'.9rem', boxSizing:'border-box', fontFamily:'inherit', background:'#fff' }}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Row: price + market_price + stock */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                {[
                  { key:'price',        label:'Your Price (₹) *', placeholder:'40' },
                  { key:'market_price', label:'Market Price (₹)', placeholder:'60' },
                  { key:'stock',        label:'Stock Qty *',       placeholder:'50' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:4, display:'block' }}>{f.label}</label>
                    <input type="number" min="0" value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:'var(--radius-sm)', fontSize:'.9rem', boxSizing:'border-box', fontFamily:'inherit' }} />
                  </div>
                ))}
              </div>

              {/* Badge */}
              <div>
                <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:4, display:'block' }}>Badge</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {BADGES.map(b => (
                    <button key={b} type="button" onClick={() => setForm(f => ({ ...f, badge: b }))}
                      style={{ padding:'5px 12px', border:'1.5px solid', borderColor: form.badge === b ? 'var(--green)' : '#E5E7EB', background: form.badge === b ? 'var(--green-light)' : '#fff', color: form.badge === b ? 'var(--green)' : 'var(--text-secondary)', borderRadius:20, fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:4, display:'block' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                  placeholder="Fresh organic tomatoes grown without pesticides..."
                  style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #E5E7EB', borderRadius:'var(--radius-sm)', fontSize:'.9rem', boxSizing:'border-box', fontFamily:'inherit', resize:'vertical' }} />
              </div>

              <button type="submit" id="save-product-btn" disabled={saving}
                style={{ padding:'14px', background: saving ? '#9CA3AF' : 'var(--green)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontWeight:700, fontSize:'1rem', cursor: saving ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' }}>
                <Upload size={18} />
                {saving ? (lang === 'en' ? 'Listing...' : 'लिस्ट हो रहा है...') : (lang === 'en' ? 'List in Shop' : 'दुकान में लिस्ट करें')}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
