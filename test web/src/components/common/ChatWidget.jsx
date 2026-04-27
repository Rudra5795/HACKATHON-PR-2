import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ArrowLeft, CheckCircle, Sprout } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Local storage key for chat messages
const CHATS_KEY = 'fd-chats';

const loadChats = () => {
  try { return JSON.parse(localStorage.getItem(CHATS_KEY)) || {}; }
  catch { return {}; }
};
const saveChats = (chats) => localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

// Farmer data for display  
const FARMER_DB = {
  1: { name: 'Ramesh Patel', nameHi: 'रमेश पटेल', emoji: '👨‍🌾', specialty: 'Organic Vegetables' },
  2: { name: 'Sunita Devi', nameHi: 'सुनीता देवी', emoji: '👩‍🌾', specialty: 'Apples & Fruits' },
  3: { name: 'Arjun Singh', nameHi: 'अर्जुन सिंह', emoji: '👨‍🌾', specialty: 'Wheat & Grains' },
  4: { name: 'Lakshmi Bai', nameHi: 'लक्ष्मी बाई', emoji: '👩‍🌾', specialty: 'Fresh Dairy' },
  5: { name: 'Kiran Kumar', nameHi: 'किरण कुमार', emoji: '👨‍🌾', specialty: 'Rice & Millets' },
  6: { name: 'Meena Kumari', nameHi: 'मीना कुमारी', emoji: '👩‍🌾', specialty: 'Spices & Herbs' },
};

// Consumer data for farmer-side chat
const CONSUMER_DB = {
  c1: { name: 'Priya Sharma', emoji: '👩', lastOrder: 'ORD-2841' },
  c2: { name: 'Amit Verma', emoji: '👨', lastOrder: 'ORD-2840' },
  c3: { name: 'Neha Gupta', emoji: '👩', lastOrder: 'ORD-2839' },
};

export default function ChatWidget() {
  const { session, profile, lang, cart } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // farmerId or consumerId
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState(loadChats);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);

  const isFarmer = profile?.role === 'farmer';
  const isConsumer = profile?.role === 'consumer';

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChat]);

  // Stop pulse after first open
  useEffect(() => {
    if (isOpen) setPulse(false);
  }, [isOpen]);

  if (!session) return null;

  // Get farmer IDs the consumer has bought from (from cart items)
  const getBoughtFarmerIds = () => {
    const ids = new Set();
    cart.forEach(item => {
      if (item.farmerId || item.farmer_id) ids.add(item.farmerId || item.farmer_id);
    });
    // Always show some farmers for demo if cart has items
    if (ids.size === 0 && cart.length > 0) ids.add(1);
    // Show at least farmer 1 and 2 for demo
    if (ids.size === 0) { ids.add(1); ids.add(2); }
    return [...ids];
  };

  const getContactList = () => {
    if (isConsumer) {
      return getBoughtFarmerIds().map(id => ({
        id: `f${id}`,
        ...FARMER_DB[id],
        role: 'farmer',
      })).filter(Boolean);
    } else {
      // Farmer sees consumers who bought their products
      return Object.entries(CONSUMER_DB).map(([id, data]) => ({
        id,
        ...data,
        role: 'consumer',
      }));
    }
  };

  const getChatKey = (contactId) => {
    const userId = session.user.id.slice(0, 8);
    return `${userId}_${contactId}`;
  };

  const getMessages = (contactId) => {
    const key = getChatKey(contactId);
    return chats[key] || [];
  };

  const getLastMessage = (contactId) => {
    const msgs = getMessages(contactId);
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  };

  const getUnreadCount = (contactId) => {
    const msgs = getMessages(contactId);
    return msgs.filter(m => !m.read && m.from !== 'me').length;
  };

  const handleSend = () => {
    if (!message.trim() || !activeChat) return;
    const key = getChatKey(activeChat);
    const newMsg = {
      id: Date.now(),
      text: message.trim(),
      from: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    const updated = { ...chats, [key]: [...(chats[key] || []), newMsg] };
    setChats(updated);
    saveChats(updated);
    setMessage('');

    // Simulate reply after 1.5s
    setTimeout(() => {
      const contact = getContactList().find(c => c.id === activeChat);
      const replies = lang === 'en'
        ? ['Yes, it\'s freshly harvested today! 🌿', 'Thank you for your order! 🙏', 'I\'ll check and get back to you.', 'Your order will be packed soon! 📦', 'Sure, I can arrange that for you.']
        : ['हां, आज ही ताज़ा काटा गया है! 🌿', 'आपके ऑर्डर के लिए धन्यवाद! 🙏', 'मैं चेक करके बताता/बताती हूं।', 'आपका ऑर्डर जल्द पैक हो जाएगा! 📦', 'ज़रूर, मैं आपके लिए व्यवस्था कर सकता/सकती हूं।'];
      const reply = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        from: 'them',
        name: contact?.name || 'Farmer',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };
      const autoUpdated = { ...loadChats() };
      autoUpdated[key] = [...(autoUpdated[key] || []), reply];
      setChats(autoUpdated);
      saveChats(autoUpdated);
    }, 1500);
  };

  const contacts = getContactList();
  const activeContact = contacts.find(c => c.id === activeChat);
  const totalUnread = contacts.reduce((sum, c) => sum + getUnreadCount(c.id), 0);

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        className={`chat-fab ${pulse ? 'pulse' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        id="chat-fab"
        aria-label="Chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && totalUnread > 0 && (
          <span className="chat-fab-badge">{totalUnread}</span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="chat-panel" id="chat-panel">
          {/* Header */}
          <div className="chat-header">
            {activeChat && (
              <button className="chat-back-btn" onClick={() => setActiveChat(null)}>
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="chat-header-info">
              {activeChat ? (
                <>
                  <span className="chat-header-avatar">{activeContact?.emoji}</span>
                  <div>
                    <h3>{lang === 'en' ? activeContact?.name : (activeContact?.nameHi || activeContact?.name)}</h3>
                    <span className="chat-online-status">
                      {lang === 'en' ? 'Online' : 'ऑनलाइन'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  <h3>{isFarmer
                    ? (lang === 'en' ? 'Customer Messages' : 'ग्राहक संदेश')
                    : (lang === 'en' ? 'Chat with Farmers' : 'किसानों से चैट')
                  }</h3>
                </>
              )}
            </div>
          </div>

          {/* Contact List OR Chat Messages */}
          {!activeChat ? (
            <div className="chat-contacts">
              {contacts.length === 0 ? (
                <div className="chat-empty">
                  <span style={{ fontSize: '2.5rem' }}>{isFarmer ? '👥' : '🌾'}</span>
                  <p>{isFarmer
                    ? (lang === 'en' ? 'No customer messages yet' : 'अभी तक कोई ग्राहक संदेश नहीं')
                    : (lang === 'en' ? 'Buy products to chat with farmers' : 'किसानों से चैट करने के लिए उत्पाद खरीदें')
                  }</p>
                </div>
              ) : (
                contacts.map(contact => {
                  const last = getLastMessage(contact.id);
                  const unread = getUnreadCount(contact.id);
                  return (
                    <button key={contact.id} className="chat-contact-item" onClick={() => setActiveChat(contact.id)}>
                      <div className="chat-contact-avatar">
                        <span>{contact.emoji}</span>
                        <span className="chat-contact-online"></span>
                      </div>
                      <div className="chat-contact-info">
                        <div className="chat-contact-name">
                          {lang === 'en' ? contact.name : (contact.nameHi || contact.name)}
                          {contact.role === 'farmer' && <CheckCircle size={12} color="var(--green)" style={{ marginLeft: 4 }} />}
                        </div>
                        <div className="chat-contact-preview">
                          {last ? last.text.slice(0, 40) + (last.text.length > 40 ? '…' : '') : (
                            contact.specialty || contact.lastOrder || (lang === 'en' ? 'Start a conversation' : 'बातचीत शुरू करें')
                          )}
                        </div>
                      </div>
                      <div className="chat-contact-meta">
                        {last && <span className="chat-contact-time">{last.time}</span>}
                        {unread > 0 && <span className="chat-contact-unread">{unread}</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="chat-messages">
                {getMessages(activeChat).length === 0 && (
                  <div className="chat-empty" style={{ paddingTop: 60 }}>
                    <span style={{ fontSize: '2.5rem' }}>👋</span>
                    <p>{lang === 'en'
                      ? `Say hi to ${activeContact?.name}!`
                      : `${activeContact?.nameHi || activeContact?.name} को नमस्ते कहें!`
                    }</p>
                    <div className="chat-quick-msgs">
                      {(lang === 'en'
                        ? ['Hi! Is this organic?', 'When was this harvested?', 'Can I get a bulk order?']
                        : ['नमस्ते! क्या यह जैविक है?', 'इसे कब काटा गया?', 'क्या मुझे थोक ऑर्डर मिल सकता है?']
                      ).map((q, i) => (
                        <button key={i} className="chat-quick-msg" onClick={() => { setMessage(q); }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {getMessages(activeChat).map(msg => (
                  <div key={msg.id} className={`chat-bubble ${msg.from === 'me' ? 'me' : 'them'}`}>
                    <div className="chat-bubble-text">{msg.text}</div>
                    <div className="chat-bubble-time">{msg.time}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-bar" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={lang === 'en' ? 'Type a message...' : 'संदेश लिखें...'}
                  id="chat-input"
                  autoFocus
                />
                <button type="submit" className="chat-send-btn" disabled={!message.trim()} id="chat-send-btn">
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
