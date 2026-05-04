import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Send, ArrowLeft, CheckCircle, Phone, Video, MessageCircle, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, fetchFarmers } from '../lib/supabase';

export default function ChatPage() {
  const { lang, session, profile } = useApp();
  const isFarmer = profile?.role === 'farmer';

  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const myId = session?.user?.id;

  // 1. Fetch initial contacts and messages
  useEffect(() => {
    if (!myId) return;

    const loadChats = async () => {
      // Fetch all messages involving the current user
      const { data: msgs, error: msgsErr } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, role, avatar_url),
          receiver:profiles!receiver_id(id, full_name, role, avatar_url)
        `)
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: true });

      if (msgsErr) console.error('Error fetching messages:', msgsErr);
      setMessages(msgs || []);

      // Build contact list from messages
      const contactMap = new Map();
      
      (msgs || []).forEach(m => {
        const otherPerson = m.sender_id === myId ? m.receiver : m.sender;
        if (!otherPerson) return;
        
        if (!contactMap.has(otherPerson.id)) {
          contactMap.set(otherPerson.id, {
            id: otherPerson.id,
            name: otherPerson.full_name || 'User',
            role: otherPerson.role,
            avatar: otherPerson.avatar_url,
            emoji: otherPerson.role === 'farmer' ? '👨‍🌾' : '👤',
            lastMessage: m,
            unreadCount: 0
          });
        } else {
          const contact = contactMap.get(otherPerson.id);
          if (new Date(m.created_at) > new Date(contact.lastMessage.created_at)) {
            contact.lastMessage = m;
          }
        }
        
        if (m.receiver_id === myId && !m.read) {
          contactMap.get(otherPerson.id).unreadCount++;
        }
      });

      // If user is a consumer, also fetch all real farmers so they can initiate chat
      if (!isFarmer) {
        const allFarmers = await fetchFarmers().catch(() => []);
        
        for (const f of allFarmers) {
          if (f.user_id && !contactMap.has(f.user_id)) {
            contactMap.set(f.user_id, {
              id: f.user_id,
              name: f.name || f.name_hi,
              role: 'farmer',
              avatar: f.image_url,
              emoji: '👨‍🌾',
              location: f.location || f.location_hi,
              specialty: f.specialty,
              verified: f.verified,
              lastMessage: null,
              unreadCount: 0
            });
          }
        }
      }

      setContacts(Array.from(contactMap.values()));
      setLoading(false);
    };

    loadChats();

    // 2. Subscribe to realtime messages
    const channel = supabase.channel('realtime_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        console.log('Realtime payload received:', payload);
        if (payload.new.receiver_id !== myId && payload.new.sender_id !== myId) return;

        // Fetch the sender profile for the new message
        supabase.from('profiles').select('*').eq('id', payload.new.sender_id).single()
          .then(({ data: senderProfile, error: profErr }) => {
            if (profErr) console.error('Error fetching sender profile:', profErr);
            
            const newMsg = { ...payload.new, sender: senderProfile || { id: payload.new.sender_id, full_name: 'Unknown' } };
            setMessages(prev => {
              // Avoid duplicates if we sent it and optimistic update already added it
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            
            // Update contact list
            setContacts(prev => {
              const newContacts = [...prev];
              const cIdx = newContacts.findIndex(c => c.id === payload.new.sender_id || c.id === payload.new.receiver_id);
              const otherId = payload.new.sender_id === myId ? payload.new.receiver_id : payload.new.sender_id;
              
              if (cIdx >= 0) {
                newContacts[cIdx].lastMessage = newMsg;
                if (payload.new.receiver_id === myId && selectedContact !== payload.new.sender_id) {
                  newContacts[cIdx].unreadCount++;
                } else if (payload.new.receiver_id === myId) {
                  // If we are actively chatting, mark as read immediately
                  markAsRead(payload.new.sender_id);
                }
              } else if (senderProfile && payload.new.receiver_id === myId) {
                newContacts.push({
                  id: senderProfile.id,
                  name: senderProfile.full_name || 'User',
                  role: senderProfile.role,
                  avatar: senderProfile.avatar_url,
                  emoji: senderProfile.role === 'farmer' ? '👨‍🌾' : '👤',
                  lastMessage: newMsg,
                  unreadCount: selectedContact !== senderProfile.id ? 1 : 0
                });
              }
              return newContacts;
            });
          });
      })
      .subscribe((status, err) => {
        console.log('Realtime subscription status:', status);
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, isFarmer]);

  // Mark messages as read when contact is selected
  const markAsRead = async (contactId) => {
    await supabase.from('messages')
      .update({ read: true })
      .eq('receiver_id', myId)
      .eq('sender_id', contactId)
      .eq('read', false);
      
    setMessages(prev => prev.map(m => 
      m.sender_id === contactId && m.receiver_id === myId ? { ...m, read: true } : m
    ));
    
    setContacts(prev => prev.map(c => 
      c.id === contactId ? { ...c, unreadCount: 0 } : c
    ));
  };

  useEffect(() => {
    if (selectedContact) {
      inputRef.current?.focus();
      markAsRead(selectedContact);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let sorted = [...contacts].sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
      return timeB - timeA;
    });
    
    if (!term) return sorted;
    return sorted.filter(c => (c.name || '').toLowerCase().includes(term));
  }, [contacts, searchTerm]);

  const activeContact = contacts.find(c => c.id === selectedContact);

  const activeMessages = useMemo(() => {
    if (!selectedContact) return [];
    return messages.filter(m => 
      (m.sender_id === myId && m.receiver_id === selectedContact) ||
      (m.sender_id === selectedContact && m.receiver_id === myId)
    );
  }, [messages, selectedContact, myId]);

  // Send message
  const handleSend = async () => {
    if (!message.trim() || !selectedContact) return;
    
    const msgText = message.trim();
    setMessage('');
    
    const newMsgObj = {
      sender_id: myId,
      receiver_id: selectedContact,
      text: msgText,
      read: false
    };

    // Optimistic UI update
    const optimisticMsg = {
      ...newMsgObj,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      sender: { id: myId, full_name: profile?.full_name }
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setContacts(prev => {
      const idx = prev.findIndex(c => c.id === selectedContact);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].lastMessage = optimisticMsg;
        return next;
      }
      return prev;
    });

    // Actually insert to Supabase
    const { data, error } = await supabase.from('messages').insert(newMsgObj).select().single();
    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Make sure the database table is created.');
      // Revert optimistic update
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setContacts(prev => {
        const next = [...prev];
        const idx = next.findIndex(c => c.id === selectedContact);
        if (idx >= 0) {
          // Revert lastMessage if possible (simplified approach: just rely on next refresh or ignore for now)
        }
        return next;
      });
    } else {
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...data, sender: optimisticMsg.sender } : m));
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach(m => {
      const d = new Date(m.created_at).toLocaleDateString();
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

          <div className="chat-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search contacts...' : 'संपर्क खोजें...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="chat-contact-list">
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="chat-no-results">
                <Search size={32} />
                <p>{lang === 'en' ? 'No contacts found' : 'कोई संपर्क नहीं मिला'}</p>
              </div>
            ) : (
              filteredContacts.map(c => renderContactItem(c))
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
                </div>
                <div className="chat-main-info">
                  <h3>
                    {activeContact.name}
                    {activeContact.verified && <CheckCircle size={14} className="chat-verified" />}
                  </h3>
                  <span className="chat-main-status">
                    {lang === 'en' ? 'Active' : 'सक्रिय'}
                  </span>
                </div>
                <div className="chat-main-actions">
                  <button className="chat-action-btn" title="Call"><Phone size={18} /></button>
                  <button className="chat-action-btn" title="Video"><Video size={18} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages-area">
                {activeMessages.length === 0 ? (
                  <div className="chat-welcome">
                    <div className="chat-welcome-avatar">
                      {activeContact.avatar ? (
                        <img src={activeContact.avatar} alt="" />
                      ) : (
                        <span>{activeContact.emoji || '👤'}</span>
                      )}
                    </div>
                    <h3>{activeContact.name}</h3>
                    {activeContact.specialty && <p className="chat-welcome-specialty">🌱 {activeContact.specialty}</p>}
                    <p className="chat-welcome-hint">
                      {lang === 'en' ? 'Send a message to start the conversation' : 'बातचीत शुरू करने के लिए संदेश भेजें'}
                    </p>
                    <div className="chat-quick-actions">
                      {(lang === 'en'
                        ? ['Hi! Are your products organic?', 'Can I place a bulk order?', 'Hello!']
                        : ['नमस्ते! क्या आपके उत्पाद जैविक हैं?', 'क्या मैं थोक ऑर्डर दे सकता/सकती हूं?', 'नमस्ते!']
                      ).map((q, i) => (
                        <button key={i} className="chat-quick-btn" onClick={() => setMessage(q)}>{q}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  Object.entries(groupMessagesByDate(activeMessages)).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="chat-date-divider"><span>{date}</span></div>
                      {msgs.map(msg => {
                        const isMe = msg.sender_id === myId;
                        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={msg.id} className={`chat-msg ${isMe ? 'sent' : 'received'}`}>
                            <div className="chat-msg-bubble">
                              <p>{msg.text}</p>
                              <span className="chat-msg-time">
                                {time}
                                {isMe && <CheckCircle size={10} style={{ marginLeft: 4, opacity: msg.read ? 1 : 0.5 }} />}
                              </span>
                            </div>
                          </div>
                        );
                      })}
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
    const lastMsg = c.lastMessage;
    const isActive = selectedContact === c.id;

    return (
      <button
        key={c.id}
        className={`chat-contact ${isActive ? 'active' : ''}`}
        onClick={() => setSelectedContact(c.id)}
        id={`contact-${c.id}`}
      >
        <div className="chat-contact-avatar-wrap">
          {c.avatar ? (
            <img src={c.avatar} alt={c.name} className="chat-contact-img" />
          ) : (
            <span className="chat-contact-emoji">{c.emoji || '👤'}</span>
          )}
        </div>
        <div className="chat-contact-body">
          <div className="chat-contact-top">
            <span className="chat-contact-name">
              {c.name}
              {c.verified && <CheckCircle size={12} className="chat-verified-sm" />}
            </span>
            {lastMsg && <span className="chat-contact-time">{new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
          <div className="chat-contact-bottom">
            <span className="chat-contact-preview">
              {lastMsg
                ? (lastMsg.sender_id === myId ? '✓ ' : '') + lastMsg.text.slice(0, 35) + (lastMsg.text.length > 35 ? '…' : '')
                : c.specialty || (lang === 'en' ? 'Tap to message' : 'संदेश भेजें')
              }
            </span>
            {c.unreadCount > 0 && <span className="chat-contact-badge">{c.unreadCount}</span>}
          </div>
        </div>
      </button>
    );
  }
}
