import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, Plus, Minus, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function CheckoutPage() {
  const {
    t, lang, cart, cartTotal, updateQty, clearCart,
    selectedAddress, setSelectedAddress, paymentMethod, setPaymentMethod,
    addresses, addAddress, removeAddress, session
  } = useApp();
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ type: '', typeHi: '', address: '', city: '' });
  const [isPlacing, setIsPlacing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const deliveryFee = cartTotal >= 200 ? 0 : 30;
  const discount = Math.round(cartTotal * 0.05);
  const total = cartTotal + deliveryFee - discount;

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddr.type.trim() || !newAddr.address.trim() || !newAddr.city.trim()) return;
    const id = addAddress({
      type: newAddr.type,
      typeHi: newAddr.typeHi || newAddr.type,
      address: newAddr.address,
      city: newAddr.city,
      isDefault: false,
    });
    setSelectedAddress(id);
    setNewAddr({ type: '', typeHi: '', address: '', city: '' });
    setShowAddForm(false);
  };

  const handleRemoveAddress = (e, id) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      alert(lang === 'en' ? 'You must have at least one address' : 'आपके पास कम से कम एक पता होना चाहिए');
      return;
    }
    removeAddress(id);
  };

  const handlePlaceOrder = async () => {
    if (!session) {
      alert(lang === 'en' ? 'Please log in to place an order.' : 'कृपया ऑर्डर करने के लिए लॉगिन करें।');
      navigate('/auth');
      return;
    }
    if (!selectedAddress) {
      alert(lang === 'en' ? 'Please select a delivery address.' : 'कृपया डिलीवरी का पता चुनें।');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      alert(lang === 'en' ? 'Please enter a valid phone number.' : 'कृपया एक मान्य फ़ोन नंबर दर्ज करें।');
      return;
    }

    setIsPlacing(true);

    try {
      // Group items by farmer_id
      const itemsByFarmer = {};
      cart.forEach(item => {
        const fid = item.farmer_id || item.farmerId || (item.farmers && item.farmers.id) || null;
        if (!fid) {
          console.warn('Item has no farmer_id:', item);
          // Fallback to farmer 1 if somehow missing, to prevent crash
        }
        const useFid = fid || 1;
        if (!itemsByFarmer[useFid]) itemsByFarmer[useFid] = [];
        itemsByFarmer[useFid].push(item);
      });

      const myId = session.user.id;
      const selectedAddrObj = addresses.find(a => a.id === selectedAddress);
      const shippingAddressStr = selectedAddrObj 
        ? `${selectedAddrObj.address}, ${selectedAddrObj.city}`
        : 'Unknown Address';

      // Create an order for each farmer
      for (const [farmerId, items] of Object.entries(itemsByFarmer)) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        // Distribute delivery fee and discount proportionally or simply apply to the first order.
        // For simplicity, we just charge the exact subtotal for each farmer to avoid rounding issues,
        // and add delivery fee if subtotal < 200 for this specific farmer.
        const fDeliveryFee = subtotal >= 200 ? 0 : 30;
        const fDiscount = Math.round(subtotal * 0.05);
        const fTotal = subtotal + fDeliveryFee - fDiscount;

        const orderObj = {
          consumer_id: myId,
          farmer_id: parseInt(farmerId),
          payment_method: paymentMethod,
          subtotal: subtotal,
          delivery_fee: fDeliveryFee,
          total: fTotal,
          status: 'placed',
          phone_number: phoneNumber,
          shipping_address: shippingAddressStr
        };

        // Insert order
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .insert(orderObj)
          .select('id')
          .single();

        if (orderErr) throw orderErr;

        // Insert order items
        const orderItemsObj = items.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          name: lang === 'en' ? item.name : (item.name_hi || item.name),
          price: item.price,
          qty: item.qty,
          unit: item.unit,
          emoji: item.emoji || '🛒'
        }));

        const { error: itemsErr } = await supabase
          .from('order_items')
          .insert(orderItemsObj);

        if (itemsErr) throw itemsErr;
      }

      // Success!
      clearCart();
      navigate('/tracking');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</div>
          <h2 style={{ marginBottom: 8 }}>{lang === 'en' ? 'Your cart is empty' : 'आपका कार्ट खाली है'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{lang === 'en' ? 'Add some fresh produce to get started!' : 'शुरू करने के लिए कुछ ताज़ी उपज जोड़ें!'}</p>
          <Link to="/shop" className="btn btn-primary">{t('shopNow')}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 28 }}>{t('checkout')}</h1>
        <div className="checkout-layout">
          <div>
            {/* ── Delivery Address ── */}
            <div className="checkout-section fade-in-up">
              <h2><MapPin size={20} /> {t('deliveryAddress')}</h2>
              {addresses.map(a => (
                <div key={a.id} className={`address-card ${selectedAddress === a.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(a.id)} id={`address-${a.id}`}>
                  <div className="radio"></div>
                  <div style={{ flex: 1 }}>
                    <h3>
                      {lang === 'en' ? a.type : a.typeHi}{' '}
                      {a.isDefault && <span className="badge badge-green" style={{ marginLeft: 8 }}>Default</span>}
                    </h3>
                    <p>{a.address}</p>
                    <p>{a.city}</p>
                  </div>
                  {addresses.length > 1 && (
                    <button
                      className="btn-icon"
                      style={{ width: 32, height: 32, color: '#DC2626', background: '#FEF2F2', borderRadius: 8, flexShrink: 0 }}
                      onClick={(e) => handleRemoveAddress(e, a.id)}
                      title={lang === 'en' ? 'Remove address' : 'पता हटाएं'}
                      id={`remove-addr-${a.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add Address Form */}
              {showAddForm ? (
                <form onSubmit={handleAddAddress} className="address-form" id="add-address-form">
                  <div className="address-form-header">
                    <h3>{lang === 'en' ? 'Add New Address' : 'नया पता जोड़ें'}</h3>
                    <button type="button" className="btn-icon" style={{ width: 28, height: 28 }}
                      onClick={() => setShowAddForm(false)}><X size={14} /></button>
                  </div>
                  <div className="address-form-fields">
                    <div className="form-group">
                      <label>{lang === 'en' ? 'Label' : 'लेबल'}</label>
                      <input
                        type="text"
                        placeholder={lang === 'en' ? 'e.g. Home, Office, Mom\'s House' : 'जैसे: घर, ऑफिस, माँ का घर'}
                        value={newAddr.type}
                        onChange={e => setNewAddr(p => ({ ...p, type: e.target.value }))}
                        required
                        id="addr-label-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'en' ? 'Street Address' : 'सड़क का पता'}</label>
                      <input
                        type="text"
                        placeholder={lang === 'en' ? 'House/Flat No., Street, Area' : 'मकान/फ्लैट नं., सड़क, क्षेत्र'}
                        value={newAddr.address}
                        onChange={e => setNewAddr(p => ({ ...p, address: e.target.value }))}
                        required
                        id="addr-street-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>{lang === 'en' ? 'City, State - Pincode' : 'शहर, राज्य - पिनकोड'}</label>
                      <input
                        type="text"
                        placeholder={lang === 'en' ? 'e.g. Gurugram, Haryana - 122001' : 'जैसे: गुरुग्राम, हरियाणा - 122001'}
                        value={newAddr.city}
                        onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))}
                        required
                        id="addr-city-input"
                      />
                    </div>
                  </div>
                  <div className="address-form-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>
                      {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" id="save-address-btn">
                      {lang === 'en' ? 'Save Address' : 'पता सहेजें'}
                    </button>
                  </div>
                </form>
              ) : (
                <button className="btn btn-ghost" id="add-address-btn"
                  style={{ width: '100%', justifyContent: 'center', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: 16 }}
                  onClick={() => setShowAddForm(true)}>
                  + {t('addNewAddress')}
                </button>
              )}
            </div>

            {/* ── Contact Details ── */}
            <div className="checkout-section fade-in-up stagger-1" style={{ marginTop: 24 }}>
              <h2><Truck size={20} /> {lang === 'en' ? 'Contact Details' : 'संपर्क विवरण'}</h2>
              <div className="form-group" style={{ maxWidth: 400 }}>
                <label>{lang === 'en' ? 'Phone Number' : 'फ़ोन नंबर'}</label>
                <input
                  type="tel"
                  placeholder={lang === 'en' ? 'Enter 10-digit mobile number' : '10 अंकों का मोबाइल नंबर दर्ज करें'}
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>

            {/* ── Payment Method ── */}
            <div className="checkout-section fade-in-up stagger-2">
              <h2><CreditCard size={20} /> {t('paymentMethod')}</h2>
              <div className="payment-options">
                <div className={`payment-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('upi')} id="pay-upi">
                  <div className="icon">📱</div>
                  <h3>{t('upiPayment')}</h3>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>GPay, PhonePe, Paytm</span>
                </div>
                <div className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')} id="pay-cod">
                  <div className="icon">💵</div>
                  <h3>{t('cashOnDelivery')}</h3>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Pay when delivered' : 'डिलीवरी पर भुगतान'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="order-summary-card fade-in-up stagger-3" id="order-summary">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>{t('orderSummary')}</h2>
            {cart.map(item => (
              <div className="summary-item" key={item.id}>
                <span className="item-emoji">{item.emoji || '🛒'}</span>
                <div className="item-info">
                  <h4>{lang === 'en' ? item.name : item.nameHi}</h4>
                  <p>₹{item.price} × {item.qty}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn btn-icon" style={{ width: 28, height: 28, background: 'var(--bg)', border: '1px solid #E5E7EB' }}
                    onClick={() => updateQty(item.id, item.qty - 1)}><Minus size={14} /></button>
                  <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button className="btn btn-icon" style={{ width: 28, height: 28, background: 'var(--green-light)', border: '1px solid var(--green)' }}
                    onClick={() => updateQty(item.id, item.qty + 1)}><Plus size={14} /></button>
                </div>
                <span className="item-price">₹{item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div className="summary-row"><span>{t('subtotal')}</span><span>₹{cartTotal}</span></div>
              <div className="summary-row"><span>{t('deliveryFee')}</span><span className="green">{deliveryFee === 0 ? t('free') : `₹${deliveryFee}`}</span></div>
              <div className="summary-row"><span>{t('discount')} (5%)</span><span className="green">-₹{discount}</span></div>
              <div className="summary-row total"><span>{t('total')}</span><span>₹{total}</span></div>
            </div>
            <button 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', justifyContent: 'center', marginTop: 20 }} 
              id="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isPlacing}
            >
              {isPlacing ? (
                <><span className="spinner" style={{width: 18, height: 18, marginRight: 8, borderWidth: 2}}></span> {lang === 'en' ? 'Placing...' : 'हो रहा है...'}</>
              ) : (
                <><Truck size={20} /> {t('placeOrder')}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
