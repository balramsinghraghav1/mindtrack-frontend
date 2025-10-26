import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smile } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const MOODS = [
  { emoji: '😊', label: 'Great', color: '#84cc16' },
  { emoji: '😌', label: 'Good', color: '#a3e635' },
  { emoji: '😐', label: 'Okay', color: '#fbbf24' },
  { emoji: '😔', label: 'Down', color: '#f59e0b' },
  { emoji: '😡', label: 'Angry', color: '#ef4444' },
  { emoji: '😴', label: 'Tired', color: '#8b5cf6' }
];

export default function MoodPicker({ userId }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [todayMood, setTodayMood] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadTodayMood();
  }, [userId]);

  async function loadTodayMood() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const moodDoc = await getDoc(doc(db, 'moods', `${userId}_${today}`));
      if (moodDoc.exists()) {
        setTodayMood(moodDoc.data().mood);
        setSelectedMood(moodDoc.data().mood);
      }
    } catch (error) {
      console.error('Error loading mood:', error);
    }
  }

  async function saveMood(mood) {
    const today = new Date().toISOString().split('T')[0];
    try {
      await setDoc(doc(db, 'moods', `${userId}_${today}`), {
        mood: mood,
        date: today,
        userId: userId,
        timestamp: new Date().toISOString()
      });
      setSelectedMood(mood);
      setTodayMood(mood);
      setShowPicker(false);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
      style={{ marginBottom: '1.5rem' }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: showPicker ? '1rem' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Smile size={24} color="#fbbf24" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
            How are you feeling today?
          </h3>
        </div>
        
        {todayMood && !showPicker && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>{todayMood}</span>
            <button
              onClick={() => setShowPicker(true)}
              className="secondary-button"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              Change
            </button>
          </div>
        )}
      </div>

      {(!todayMood || showPicker) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '0.75rem',
            marginTop: '1rem'
          }}
        >
          {MOODS.map((mood) => (
            <motion.button
              key={mood.emoji}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => saveMood(mood.emoji)}
              style={{
                background: selectedMood === mood.emoji 
                  ? `linear-gradient(135deg, ${mood.color}, ${mood.color}dd)`
                  : 'rgba(255, 255, 255, 0.9)',
                border: selectedMood === mood.emoji 
                  ? `2px solid ${mood.color}`
                  : '2px solid rgba(132, 204, 22, 0.2)',
                borderRadius: '16px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: selectedMood === mood.emoji
                  ? `0 4px 20px ${mood.color}40`
                  : '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {mood.emoji}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600',
                color: selectedMood === mood.emoji ? 'white' : '#78716c'
              }}>
                {mood.label}
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
