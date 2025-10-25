import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyAYp00KLVJ0UQUkH6gMDvnn7qui7A-2C-U'; 

export default function AIChatbot({ currentHabits, onAddHabit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Pulse AI assistant. I can help you find habits that sync with your bio rhythm. What are your wellness goals?"
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

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const context = currentHabits.length > 0
        ? `User currently tracks these habits: ${currentHabits.join(', ')}. `
        : '';

      const prompt = `${context}You are a wellness coach specializing in bio rhythms and habit formation. User asks: "${userMessage}". 
      
      Provide a helpful, concise response (2-3 sentences). If suggesting habits, format as:
      "I recommend: [Habit Name]" so the user can easily add it.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting. Try asking about habit suggestions for sleep, energy, or focus!" 
      }]);
    }

    setLoading(false);
  }

  function extractHabitFromMessage(message) {
    // Look for patterns like "I recommend: X" or suggest X
    const patterns = [
      /I recommend:?\s*([^.!?\n]+)/i,
      /suggest:?\s*([^.!?\n]+)/i,
      /try:?\s*([^.!?\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim().replace(/['"]/g, '');
      }
    }
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9333ea, #ec4899)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(147, 51, 234, 0.5)',
              zIndex: 1000
            }}
          >
            <MessageSquare size={28} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '380px',
              height: '550px',
              background: '#141414',
              borderRadius: '20px',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, #9333ea, #ec4899)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={24} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                    Pulse AI
                  </h3>
                  <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: 0 }}>
                    Your Bio Rhythm Coach
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <div style={{
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #9333ea, #ec4899)'
                      : '#1a1a1a',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    color: 'white',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    border: msg.role === 'assistant' ? '1px solid rgba(147, 51, 234, 0.2)' : 'none'
                  }}>
                    {msg.content}
                  </div>

                  {/* Add Habit Button */}
                  {msg.role === 'assistant' && extractHabitFromMessage(msg.content) && (
                    <button
                      onClick={() => {
                        const habit = extractHabitFromMessage(msg.content);
                        onAddHabit(habit);
                        setMessages(prev => [...prev, {
                          role: 'assistant',
                          content: `✅ Added "${habit}" to your habits!`
                        }]);
                      }}
                      style={{
                        marginTop: '0.5rem',
                        padding: '6px 12px',
                        background: 'rgba(147, 51, 234, 0.2)',
                        border: '1px solid rgba(147, 51, 234, 0.4)',
                        borderRadius: '8px',
                        color: '#9333ea',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      + Add This Habit
                    </button>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{
                    background: '#1a1a1a',
                    padding: '0.75rem 1rem',
                    borderRadius: '16px 16px 16px 4px',
                    border: '1px solid rgba(147, 51, 234, 0.2)'
                  }}>
                    <div className="loading-wave">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{
              padding: '1rem',
              borderTop: '1px solid rgba(147, 51, 234, 0.2)',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about habits..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#1a1a1a',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  padding: '0.75rem',
                  background: input.trim() && !loading 
                    ? 'linear-gradient(135deg, #9333ea, #ec4899)'
                    : '#1a1a1a',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '44px'
                }}
              >
                <Send size={20} color="white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
