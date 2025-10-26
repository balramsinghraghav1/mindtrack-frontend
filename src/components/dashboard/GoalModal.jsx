import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Calendar } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function GoalModal({ isOpen, onClose, userId, onSuccess }) {
  const [goalText, setGoalText] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!goalText.trim() || !targetDate) return;

    setLoading(true);

    try {
      const goalId = `${userId}_${Date.now()}`;
      await setDoc(doc(db, 'goals', goalId), {
        goal: goalText,
        targetDate: targetDate,
        userId: userId,
        createdAt: new Date().toISOString(),
        completed: false
      });

      setGoalText('');
      setTargetDate('');
      onSuccess();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    }

    setLoading(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              zIndex: 1001
            }}
          >
            <div className="glass-card" style={{ padding: '2rem' }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Target size={28} color="#fbbf24" />
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700',
                    margin: 0,
                    background: 'linear-gradient(135deg, #fbbf24, #84cc16)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Set Your Goal
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(132, 204, 22, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(132, 204, 22, 0.2)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(132, 204, 22, 0.1)'}
                >
                  <X size={20} color="#78716c" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#57534e'
                  }}>
                    What's your goal?
                  </label>
                  <textarea
                    className="nature-input"
                    placeholder="e.g., Exercise 30 minutes daily for 30 days"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    required
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#57534e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Calendar size={18} color="#fbbf24" />
                    Target Date
                  </label>
                  <input
                    type="date"
                    className="nature-input"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    className="energy-button"
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? (
                      <div className="loading-wave">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      '🎯 Set Goal'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="secondary-button"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
