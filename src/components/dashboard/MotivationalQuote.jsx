import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const QUOTES = [
  "Small steps every day. You've got this!",
  "Consistency builds results — keep going.",
  "Celebrate progress, not perfection.",
  "One habit at a time. One win at a time.",
  "You're closer than you think.",
  "Turn today's effort into tomorrow's routine.",
  "Build momentum — the rest will follow."
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState('');
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Get day of week (0-6) to show consistent quote per day
    const dayIndex = new Date().getDay();
    setQuote(QUOTES[dayIndex]);

    // Auto-hide after 8 seconds
    const timer = setTimeout(() => setShow(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: '500px',
            width: 'calc(100% - 2rem)'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(132, 204, 22, 0.95))',
            backdropFilter: 'blur(20px)',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Sparkles size={24} color="white" style={{ flexShrink: 0 }} />
            <p style={{
              margin: 0,
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              lineHeight: '1.5'
            }}>
              {quote}
            </p>
            <button
              onClick={() => setShow(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.85rem',
                flexShrink: 0
              }}
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
