import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Copy, Check } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyAYp00KLVJ0UQUkH6gMDvnn7qui7A-2C-U'; // Replace with your key

export default function AIHabitSuggester({ currentHabits, onAddHabit }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function getSuggestion() {
    setLoading(true);
    setSuggestion('');

    const prompt = currentHabits.length > 0
      ? `I'm currently tracking these habits: ${currentHabits.join(', ')}. Suggest ONE new simple wellness habit that complements these. Give only the habit name in 5-8 words, no explanation.`
      : 'Suggest ONE simple wellness habit for a beginner. Give only the habit name in 5-8 words, no explanation.';

    try {
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
      const text = data.candidates[0].content.parts[0].text.trim();
      setSuggestion(text);
    } catch (error) {
      console.error('AI Error:', error);
      setSuggestion('Try: Meditate for 5 minutes daily');
    }

    setLoading(false);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ marginBottom: '1.5rem' }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <Sparkles size={24} color="#FFD93D" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          AI Habit Suggester
        </h2>
      </div>

      <button
        onClick={getSuggestion}
        disabled={loading}
        className="water-button"
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {loading ? (
          <div className="loading-wave">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <>
            <Zap size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Get AI Suggestion
          </>
        )}
      </button>

      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: 'rgba(255, 217, 61, 0.15)',
              border: '1px solid rgba(255, 217, 61, 0.3)',
              borderRadius: '12px',
              padding: '1rem'
            }}
          >
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '500',
              marginBottom: '1rem',
              color: '#FFE87C'
            }}>
              {suggestion}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onAddHabit(suggestion)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #00C9A7, #0066FF)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add This Habit
              </button>

              <button
                onClick={copyToClipboard}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}