import { useState, useRef, useEffect } from "react";
import "./AIChatWidget.css";

// ── Icons (inline SVGs to avoid extra dependencies) ─────────────
const ChatIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z"/>
  </svg>
);

// ── Quick suggestion chips ──────────────────────────────────────
const QUICK_PROMPTS = [
  "🥬 What's fresh today?",
  "📦 How does delivery work?",
  "💰 Show me best deals",
  "🌱 Organic options?",
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hey there! 👋 I'm your FarmDirect AI assistant. I can help you find fresh produce, answer questions about pricing, delivery, and more. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Sorry, I couldn't process that. Please try again! 🌿" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Hmm, I'm having trouble connecting right now. Please check if the server is running and try again. 🔌",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Chat Button ──────────────────────────────── */}
      <button
        id="ai-chat-toggle"
        className={`ai-chat-fab ${isOpen ? "ai-chat-fab--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open AI Support"}
      >
        <span className="ai-chat-fab__icon">
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </span>
        {hasUnread && !isOpen && <span className="ai-chat-fab__badge" />}
        {/* Pulse ring */}
        {!isOpen && <span className="ai-chat-fab__ring" />}
      </button>

      {/* ── Chat Box ──────────────────────────────────────────── */}
      <div className={`ai-chat-box ${isOpen ? "ai-chat-box--open" : ""}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header__left">
            <div className="ai-chat-header__avatar">
              <SparkleIcon />
            </div>
            <div>
              <h3 className="ai-chat-header__title">AI Support</h3>
              <p className="ai-chat-header__status">
                <span className="ai-chat-header__dot" />
                Always online
              </p>
            </div>
          </div>
          <button
            className="ai-chat-header__close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`ai-chat-msg ${
                msg.role === "user" ? "ai-chat-msg--user" : "ai-chat-msg--bot"
              }`}
            >
              {msg.role === "bot" && (
                <div className="ai-chat-msg__avatar">
                  <SparkleIcon />
                </div>
              )}
              <div className="ai-chat-msg__bubble">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="ai-chat-msg ai-chat-msg--bot">
              <div className="ai-chat-msg__avatar">
                <SparkleIcon />
              </div>
              <div className="ai-chat-msg__bubble ai-chat-typing">
                <span className="ai-chat-typing__dot" />
                <span className="ai-chat-typing__dot" />
                <span className="ai-chat-typing__dot" />
              </div>
            </div>
          )}

          {/* Quick prompts — only show after initial bot message */}
          {messages.length === 1 && !isLoading && (
            <div className="ai-chat-quick">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="ai-chat-quick__btn"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-chat-input">
          <input
            ref={inputRef}
            id="ai-chat-input-field"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            id="ai-chat-send"
            className="ai-chat-input__send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>

        {/* Footer */}
        <div className="ai-chat-footer">
          Powered by <strong>FarmDirect AI</strong> &middot; Gemini
        </div>
      </div>
    </>
  );
}
