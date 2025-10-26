import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyAwAYDFimuqbnv8IMc1YRo4yDKjhEtUlPs';

export default function AIChatbot({ currentHabits, onAddHabit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Pulse AI assistant. 🌊 I can help you find habits that sync with your bio rhythm. Ask me for habit suggestions!"
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
        ? `Current habits: ${currentHabits.join(', ')}. `
        : '';

      const prompt = `${context}Question: "${userMessage}". Give 1-2 sentence wellness advice. If suggesting a habit, write "I recommend: [habit name]"`;

      console.log('Sending request to Gemini...');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 150,
              topP: 1,
              topK: 1
            }
          })
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API returned ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Full AI Error:', error);
      
      // Fallback responses based on keywords
      let fallbackResponse = '';
      const lower = userMessage.toLowerCase();
      
      if (lower.includes('morning')) {
          fallbackResponse = "I recommend: 10-minute morning stretching routine. Start your day by syncing with your body's natural wake-up rhythm!";
      } else if (lower.includes('sleep') || lower.includes('bedtime')) {
          fallbackResponse = "I recommend: No screens 30 minutes before bed. This helps regulate your circadian rhythm for better sleep quality.";
      } else if (lower.includes('energy') || lower.includes('focus')) {
          fallbackResponse = "I recommend: Take a 5-minute walk every 2 hours. Movement aligns with your body's natural energy cycles.";
      } else if (lower.includes('stress') || lower.includes('relax') || lower.includes('anxiety')) {
          fallbackResponse = "I recommend: 5 minutes of deep breathing daily. This helps balance your nervous system's bio rhythm.";
      } else if (lower.includes('hydration') || lower.includes('water')) {
          fallbackResponse = "I recommend: Drink a glass of water upon waking and before meals to maintain metabolic balance.";
      } else if (lower.includes('exercise') || lower.includes('workout')) {
          fallbackResponse = "I recommend: Schedule your workouts according to your peak energy times. Morning cardio or evening strength training works well!";
      } else if (lower.includes('meal') || lower.includes('food') || lower.includes('nutrition')) {
          fallbackResponse = "I recommend: Eat small balanced meals every 3-4 hours to keep your energy levels stable throughout the day.";
      } else if (lower.includes('mood') || lower.includes('happy') || lower.includes('sad')) {
          fallbackResponse = "I recommend: Take 5 minutes for mindful journaling or gratitude practice to align emotional rhythms.";
      } else if (lower.includes('focus') || lower.includes('productivity')) {
          fallbackResponse = "I recommend: Use the Pomodoro technique – 25 min work, 5 min break – to optimize your attention cycles.";
      } else if (lower.includes('break') || lower.includes('rest')) {
          fallbackResponse = "I recommend: Take micro-breaks every hour. Even 2 minutes of stretching or walking can boost your rhythm.";
      } else if (lower.includes('sunlight') || lower.includes('daylight')) {
          fallbackResponse = "I recommend: Get at least 15 minutes of sunlight in the morning to regulate your circadian rhythm naturally.";
      } else if (lower.includes('meditation') || lower.includes('mindfulness')) {
          fallbackResponse = "I recommend: 10 minutes of meditation or mindfulness exercises daily to stabilize your mental and emotional rhythm.";
      } else if (lower.includes('heart') || lower.includes('cardio')) {
          fallbackResponse = "I recommend: 20 minutes of moderate cardio 3-4 times a week to keep your heart rhythm healthy.";
      } else if (lower.includes('digestion') || lower.includes('gut')) {
          fallbackResponse = "I recommend: Eat slowly and chew thoroughly. A steady eating rhythm helps your digestive system work efficiently.";
      } else if (lower.includes('posture') || lower.includes('back')) {
          fallbackResponse = "I recommend: Take 2-3 minute posture breaks every hour to align your spine and reduce strain.";
      } else if (lower.includes('breathing') || lower.includes('oxygen')) {
          fallbackResponse = "I recommend: Try box breathing – inhale 4, hold 4, exhale 4, hold 4 – to sync your nervous system rhythm.";
      } else if (lower.includes('brain') || lower.includes('memory')) {
          fallbackResponse = "I recommend: 10 minutes of brain games or puzzles daily to keep your cognitive rhythm sharp.";
      } else if (lower.includes('relaxation') || lower.includes('calm')) {
          fallbackResponse = "I recommend: Listen to calming music or nature sounds for 10 minutes to reset your stress rhythm.";
      } else if (lower.includes('focus') || lower.includes('concentration')) {
          fallbackResponse = "I recommend: Work in 90-minute deep focus sessions followed by 20-minute breaks – aligns with ultradian rhythm.";
      } else if (lower.includes('stretch') || lower.includes('mobility')) {
          fallbackResponse = "I recommend: 5-10 minutes of mobility exercises in the morning and evening to maintain joint rhythm.";
      } else if (lower.includes('eye') || lower.includes('vision')) {
          fallbackResponse = "I recommend: Follow the 20-20-20 rule – every 20 minutes, look at something 20 feet away for 20 seconds – to protect eye rhythm.";
      } else if (lower.includes('motivation') || lower.includes('goal')) {
          fallbackResponse = "I recommend: Set 1-3 achievable goals each morning. Tracking small wins aligns your mental rhythm with productivity.";
      } else {
          fallbackResponse = "I recommend: Drink a glass of water upon waking. Hydration kickstarts your metabolic rhythm. (Note: AI temporarily offline - this is a preset suggestion)";
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallbackResponse
      }]);
    }

    setLoading(false);
  }

  function extractHabitFromMessage(message) {
    const patterns = [
      /I recommend:?\s*([^.!?\n]+)/i,
      /suggest(?:ion)?:?\s*([^.!?\n]+)/i,
      /try:?\s*([^.!?\n]+)/i,
      /consider:?\s*([^.!?\n]+)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        let habit = match[1].trim();
        // Clean up common artifacts
        habit = habit.replace(/["'`]/g, '');
        habit = habit.replace(/\*\*/g, '');
        habit = habit.split(/[.!?]/)[0]; // Take first sentence
        return habit.trim();
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
              maxWidth: 'calc(100vw - 2rem)',
              height: '550px',
              maxHeight: 'calc(100vh - 4rem)',
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
                type="button"
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
                      type="button"
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

            {/* Quick Actions */}
            <div style={{
              padding: '0.5rem 1rem',
              borderTop: '1px solid rgba(147, 51, 234, 0.2)',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {[
                'Suggest morning habit',
                'Help with sleep',
                'Energy boost ideas'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  type="button"
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(147, 51, 234, 0.1)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: '12px',
                    color: '#9333ea',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {suggestion}
                </button>
              ))}
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
                    ? 'linear-gradient(135deg, #fbbf24, #84cc16)'
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
