import { useState, useRef, useEffect } from 'react';
import { Search, Send, ArrowLeft, CheckCircle, Phone, Video, MoreVertical, Smile, User, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { farmers } from '../data/mockData';
import { farmerAvatars } from '../data/mockData';

// ── Local storage persistence ──
const CHATS_KEY = 'fd-chat-messages';
const loadAllChats = () => { try { return JSON.parse(localStorage.getItem(CHATS_KEY)) || {}; } catch { return {}; } };
const saveAllChats = (c) => localStorage.setItem(CHATS_KEY, JSON.stringify(c));

export default function ChatPage() {
  const { lang, session, profile, cart } = useApp();
  const isFarmer = profile?.role === 'farmer';

  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [allChats, setAllChats] = useState(loadAllChats);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allChats, selectedContact]);

  // Focus input when contact selected
  useEffect(() => {
    if (selectedContact) inputRef.current?.focus();
  }, [selectedContact]);

  // ── Build contact list ──
  // For consumers: show farmers they bought from + all searchable farmers
  // For farmers: show consumers who messaged them
  const boughtFarmerIds = new Set();
  cart.forEach(item => {
    const fid = item.farmerId || item.farmer_id;
    if (fid) boughtFarmerIds.add(fid);
  });

  // All farmers as potential contacts
  const allFarmerContacts = farmers.map(f => ({
    id: `farmer_${f.id}`,
    farmerId: f.id,
    name: f.name,
    nameHi: f.nameHi,
    avatar: farmerAvatars[f.id],
    location: f.location,
    locationHi: f.locationHi,
    specialty: f.specialty,
    rating: f.rating,
    verified: f.verified,
    isBought: boughtFarmerIds.has(f.id),
    online: f.id <= 3, // simulate some online
  }));

  // For farmers, show simulated consumers
  const consumerContacts = [
    { id: 'consumer_1', name: 'Priya Sharma', emoji: '👩', lastOrder: '#ORD-2841', online: true },
    { id: 'consumer_2', name: 'Amit Verma', emoji: '👨', lastOrder: '#ORD-2840', online: false },
    { id: 'consumer_3', name: 'Neha Gupta', emoji: '👩', lastOrder: '#ORD-2839', online: true },
    { id: 'consumer_4', name: 'Rajesh Kumar', emoji: '👨', lastOrder: '#ORD-2838', online: false },
  ];

  const contacts = isFarmer ? consumerContacts : allFarmerContacts;

  // Filter contacts by search
  const filteredContacts = contacts.filter(c => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    const name = (c.name || '').toLowerCase();
    const nameHi = (c.nameHi || '').toLowerCase();
    const id = (c.id || '').toLowerCase();
    const specialty = (c.specialty || '').toLowerCase();
    const location = (c.location || '').toLowerCase();
    return name.includes(term) || nameHi.includes(term) || id.includes(term) || specialty.includes(term) || location.includes(term);
  });

  // Separate bought farmers (priority) from others
  const boughtContacts = filteredContacts.filter(c => c.isBought);
  const otherContacts = filteredContacts.filter(c => !c.isBought);

  // Chat key
  const getChatKey = (contactId) => contactId;
  const getMessages = (contactId) => allChats[getChatKey(contactId)] || [];
  const getLastMessage = (contactId) => {
    const msgs = getMessages(contactId);
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  };
  const getUnread = (contactId) => getMessages(contactId).filter(m => !m.read && m.from !== 'me').length;

  const activeContact = contacts.find(c => c.id === selectedContact);

  // Send message
  const handleSend = () => {
    if (!message.trim() || !selectedContact) return;
    const key = getChatKey(selectedContact);
    const newMsg = {
      id: Date.now(),
      text: message.trim(),
      from: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      read: true,
    };
    const updated = { ...allChats, [key]: [...(allChats[key] || []), newMsg] };
    setAllChats(updated);
    saveAllChats(updated);
    setMessage('');

    // Simulate typing + reply
    setTyping(true);
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      setTyping(false);
      const replies = lang === 'en'
        ? [
          'Yes, all our produce is 100% organic! 🌿',
          'It was harvested fresh this morning! 🌅',
          'Sure, I can arrange a bulk order for you. How much do you need?',
          'Thank you for your order! It will be packed within an hour. 📦',
          'The delivery should reach you by evening today.',
          'We also have fresh spinach and carrots available this week!',
          'Feel free to ask anything about our farming practices 😊',
          'I\'ll check the stock and get back to you shortly.',
        ]
        : [
          'हां, हमारी सारी उपज 100% जैविक है! 🌿',
          'आज सुबह ही ताज़ा काटा गया है! 🌅',
          'ज़रूर, मैं आपके लिए थोक ऑर्डर की व्यवस्था कर सकता/सकती हूं। कितना चाहिए?',
          'आपके ऑर्डर के लिए धन्यवाद! एक घंटे में पैक हो जाएगा। 📦',
          'डिलीवरी आज शाम तक आपके पास पहुंच जाएगी।',
          'इस हफ्ते ताज़ा पालक और गाजर भी उपलब्ध हैं!',
          'हमारी खेती के तरीकों के बारे में कुछ भी पूछ सकते हैं 😊',
          'मैं स्टॉक चेक करके बताता/बताती हूं।',
        ];
      const reply = {
        id: Date.now(),
        text: replies[Math.floor(Math.random() * replies.length)],
        from: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        read: false,
      };
      const latest = loadAllChats();
      latest[key] = [...(latest[key] || []), reply];
      setAllChats(latest);
      saveAllChats(latest);
    }, delay);
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(m => {
      const d = m.date || 'Today';
      if (!groups[d]) groups[d] = [];
      groups[d].push(m);
    });
    return groups;
  };

  if (!session) {
    return (
      <main className="chat-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <MessageCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
          <h2>{lang === 'en' ? 'Login to start chatting' : 'चैट शुरू करने के लिए लॉगिन करें'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            {lang === 'en' ? 'Connect directly with farmers and discuss your orders' : 'किसानों से सीधे जुड़ें और अपने ऑर्डर पर चर्चा करें'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-page">
      <div className="chat-layout">
        {/* ══════ SIDEBAR ══════ */}
        <aside className={`chat-sidebar ${selectedContact ? 'hide-mobile' : ''}`}>
          <div className="chat-sidebar-header">
            <h2><MessageCircle size={22} /> {isFarmer ? (lang === 'en' ? 'Customers' : 'ग्राहक') : (lang === 'en' ? 'Messages' : 'संदेश')}</h2>
          </div>

          {/* Search */}
          <div className="chat-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search farmers by name, location...' : 'नाम, स्थान से किसान खोजें...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              id="chat-search-input"
            />
          </div>

          {/* Contact List */}
          <div className="chat-contact-list">
            {/* Bought from section */}
            {!isFarmer && boughtContacts.length > 0 && (
              <>
                <div className="chat-list-label">
                  🛒 {lang === 'en' ? 'Your Farmers' : 'आपके किसान'}
                </div>
                {boughtContacts.map(c => renderContactItem(c))}
              </>
            )}

            {/* All / Other farmers */}
            {!isFarmer && otherContacts.length > 0 && (
              <>
                <div className="chat-list-label">
                  {boughtContacts.length > 0 ? (lang === 'en' ? 'All Farmers' : 'सभी किसान') : ''}
                </div>
                {otherContacts.map(c => renderContactItem(c))}
              </>
            )}

            {/* Farmer view */}
            {isFarmer && filteredContacts.map(c => renderContactItem(c))}

            {filteredContacts.length === 0 && (
              <div className="chat-no-results">
                <Search size={32} />
                <p>{lang === 'en' ? 'No contacts found' : 'कोई संपर्क नहीं मिला'}</p>
              </div>
            )}
          </div>
        </aside>

        {/* ══════ MAIN CHAT AREA ══════ */}
        <section className={`chat-main ${!selectedContact ? 'hide-mobile' : ''}`}>
          {selectedContact && activeContact ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <button className="chat-mobile-back" onClick={() => setSelectedContact(null)}>
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-main-avatar">
                  {activeContact.avatar ? (
                    <img src={activeContact.avatar} alt={activeContact.name} />
                  ) : (
                    <span className="chat-avatar-emoji">{activeContact.emoji || '👤'}</span>
                  )}
                  {activeContact.online && <span className="chat-avatar-online"></span>}
                </div>
                <div className="chat-main-info">
                  <h3>
                    {lang === 'en' ? activeContact.name : (activeContact.nameHi || activeContact.name)}
                    {activeContact.verified && <CheckCircle size={14} className="chat-verified" />}
                  </h3>
                  <span className="chat-main-status">
                    {typing ? (lang === 'en' ? 'typing...' : 'टाइप कर रहे हैं...') :
                      activeContact.online ? (lang === 'en' ? 'Online' : 'ऑनलाइन') : (lang === 'en' ? 'Offline' : 'ऑफलाइन')}
                  </span>
                </div>
                <div className="chat-main-actions">
                  <button className="chat-action-btn" title="Call"><Phone size={18} /></button>
                  <button className="chat-action-btn" title="Video"><Video size={18} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages-area">
                {getMessages(selectedContact).length === 0 ? (
                  <div className="chat-welcome">
                    <div className="chat-welcome-avatar">
                      {activeContact.avatar ? (
                        <img src={activeContact.avatar} alt="" />
                      ) : (
                        <span>{activeContact.emoji || '👤'}</span>
                      )}
                    </div>
                    <h3>{lang === 'en' ? activeContact.name : (activeContact.nameHi || activeContact.name)}</h3>
                    {activeContact.specialty && (
                      <p className="chat-welcome-specialty">🌱 {activeContact.specialty}</p>
                    )}
                    {activeContact.location && (
                      <p className="chat-welcome-location">📍 {lang === 'en' ? activeContact.location : (activeContact.locationHi || activeContact.location)}</p>
                    )}
                    {activeContact.rating && (
                      <p className="chat-welcome-rating">⭐ {activeContact.rating} {lang === 'en' ? 'rating' : 'रेटिंग'}</p>
                    )}
                    <p className="chat-welcome-hint">
                      {lang === 'en' ? 'Send a message to start the conversation' : 'बातचीत शुरू करने के लिए संदेश भेजें'}
                    </p>
                    <div className="chat-quick-actions">
                      {(lang === 'en'
                        ? ['Hi! Are your products organic?', 'What\'s freshly available today?', 'Can I place a bulk order?', 'Do you deliver to my area?']
                        : ['नमस्ते! क्या आपके उत्पाद जैविक हैं?', 'आज क्या ताज़ा उपलब्ध है?', 'क्या मैं थोक ऑर्डर दे सकता/सकती हूं?', 'क्या आप मेरे क्षेत्र में डिलीवर करते हैं?']
                      ).map((q, i) => (
                        <button key={i} className="chat-quick-btn" onClick={() => setMessage(q)}>{q}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  Object.entries(groupMessagesByDate(getMessages(selectedContact))).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="chat-date-divider"><span>{date}</span></div>
                      {msgs.map(msg => (
                        <div key={msg.id} className={`chat-msg ${msg.from === 'me' ? 'sent' : 'received'}`}>
                          <div className="chat-msg-bubble">
                            <p>{msg.text}</p>
                            <span className="chat-msg-time">
                              {msg.time}
                              {msg.from === 'me' && <CheckCircle size={10} style={{ marginLeft: 4, opacity: .5 }} />}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
                {typing && (
                  <div className="chat-msg received">
                    <div className="chat-msg-bubble chat-typing">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                <button type="button" className="chat-emoji-btn"><Smile size={20} /></button>
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={lang === 'en' ? 'Type a message...' : 'संदेश लिखें...'}
                  id="chat-message-input"
                />
                <button type="submit" className="chat-send" disabled={!message.trim()} id="chat-send-btn">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            /* Empty state */
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💬</div>
              <h2>{lang === 'en' ? 'Select a conversation' : 'बातचीत चुनें'}</h2>
              <p>{isFarmer
                ? (lang === 'en' ? 'Choose a customer to start chatting' : 'चैट शुरू करने के लिए ग्राहक चुनें')
                : (lang === 'en' ? 'Pick a farmer from the sidebar to message them directly' : 'किसान को सीधे संदेश भेजने के लिए साइडबार से चुनें')
              }</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );

  function renderContactItem(c) {
    const lastMsg = getLastMessage(c.id);
    const unread = getUnread(c.id);
    const isActive = selectedContact === c.id;

    return (
      <button
        key={c.id}
        className={`chat-contact ${isActive ? 'active' : ''}`}
        onClick={() => {
          setSelectedContact(c.id);
          // Mark messages as read
          const key = getChatKey(c.id);
          const msgs = (allChats[key] || []).map(m => ({ ...m, read: true }));
          const updated = { ...allChats, [key]: msgs };
          setAllChats(updated);
          saveAllChats(updated);
        }}
        id={`contact-${c.id}`}
      >
        <div className="chat-contact-avatar-wrap">
          {c.avatar ? (
            <img src={c.avatar} alt={c.name} className="chat-contact-img" />
          ) : (
            <span className="chat-contact-emoji">{c.emoji || '👤'}</span>
          )}
          {c.online && <span className="chat-contact-dot"></span>}
        </div>
        <div className="chat-contact-body">
          <div className="chat-contact-top">
            <span className="chat-contact-name">
              {lang === 'en' ? c.name : (c.nameHi || c.name)}
              {c.verified && <CheckCircle size={12} className="chat-verified-sm" />}
            </span>
            {lastMsg && <span className="chat-contact-time">{lastMsg.time}</span>}
          </div>
          <div className="chat-contact-bottom">
            <span className="chat-contact-preview">
              {lastMsg
                ? (lastMsg.from === 'me' ? '✓ ' : '') + lastMsg.text.slice(0, 35) + (lastMsg.text.length > 35 ? '…' : '')
                : c.specialty || c.lastOrder || (lang === 'en' ? 'Tap to message' : 'संदेश भेजें')
              }
            </span>
            {unread > 0 && <span className="chat-contact-badge">{unread}</span>}
          </div>
          {c.isBought && !lastMsg && (
            <span className="chat-bought-tag">
              🛒 {lang === 'en' ? 'Purchased' : 'खरीदा'}
            </span>
          )}
        </div>
      </button>
    );
  }
}
