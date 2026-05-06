import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, sendGuestChatMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hi there! I'm your event assistant. How can I help you today?", 
      isUser: false, 
      timestamp: new Date(),
      quickReplies: ["🔍 Find Events", "📋 My Bookings", "⭐ Recommendations", "🔥 Trending"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    { text: "🔍 Find Events", query: "find events in Mumbai" },
    { text: "📋 My Bookings", query: "show my bookings" },
    { text: "⭐ Recommendations", query: "recommend events for me" },
    { text: "🔥 Trending", query: "trending events" },
    { text: "❤️ My Wishlist", query: "show my wishlist" },
    { text: "❓ Help", query: "help" }
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      let response;
      if (user) {
        response = await sendChatMessage({ message: userMessage });
      } else {
        response = await sendGuestChatMessage({ message: userMessage });
      }

      const data = response.data;
      setMessages(prev => [...prev, { 
        text: data.reply || "I'm here to help! What would you like to know?", 
        isUser: false, 
        timestamp: new Date(),
        quickReplies: data.quick_replies
      }]);
      
      // Handle navigation intents
      if (data.intent === 'my_bookings') {
        setTimeout(() => {
          if (window.confirm('Would you like to view your bookings?')) {
            navigate('/bookings');
          }
        }, 500);
      } else if (data.intent === 'wishlist') {
        setTimeout(() => {
          if (window.confirm('Would you like to view your wishlist?')) {
            navigate('/wishlist');
          }
        }, 500);
      } else if (data.intent === 'profile') {
        setTimeout(() => {
          if (window.confirm('Would you like to view your profile?')) {
            navigate('/profile');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting. Please try again later.", 
        isUser: false, 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (query) => {
    setInput(query);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          transition: 'transform 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '110px',
          right: '20px',
          width: '380px',
          height: '550px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>🤖</span>
              <span style={{ fontWeight: 'bold' }}>Event Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  background: msg.isUser ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f3f4f6',
                  color: msg.isUser ? 'white' : '#1f2937'
                }}>
                  <div style={{ fontSize: '14px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    marginTop: '4px',
                    opacity: 0.7,
                    textAlign: msg.isUser ? 'right' : 'left'
                  }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#f3f4f6',
                  padding: '10px 14px',
                  borderRadius: '18px',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <span className="typing-dot">●</span>
                  <span className="typing-dot">●</span>
                  <span className="typing-dot">●</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div style={{
              padding: '12px',
              borderTop: '1px solid #eef2ff',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply.query)}
                  style={{
                    padding: '8px 14px',
                    background: '#f3f4f6',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#eef2ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #eef2ff',
            display: 'flex',
            gap: '8px',
            background: 'white'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                opacity: loading || !input.trim() ? 0.6 : 1
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .typing-dot {
          animation: typing 1.4s infinite;
          opacity: 0.5;
          display: inline-block;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `}</style>
    </>
    
  );
};

export default Chatbot;