import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './MoodTracker.css';

const moods = [
  { emoji: '🥳', label: 'Awesome' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😕', label: 'Meh' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
];

const MoodTracker = () => {
  const { currentUser } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  // Load today's mood when component mounts
  useEffect(() => {
    const fetchMood = async () => {
      if (!currentUser) return;
      const today = getTodayDateString();
      const moodDocRef = doc(db, 'users', currentUser.uid, 'moods', today);
      
      try {
        const docSnap = await getDoc(moodDocRef);
        if (docSnap.exists()) {
          setSelectedMood(docSnap.data().emoji);
        }
      } catch (error) {
        console.error("Error fetching mood: ", error);
      }
      setLoading(false);
    };
    
    fetchMood();
  }, [currentUser]);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood.emoji);
    if (!currentUser) return;

    // Save to Firebase
    try {
      const today = getTodayDateString();
      // We use a path like /users/{userId}/moods/{YYYY-MM-DD}
      const moodDocRef = doc(db, 'users', currentUser.uid, 'moods', today);
      await setDoc(moodDocRef, { 
        emoji: mood.emoji, 
        label: mood.label,
        timestamp: new Date() 
      });
    } catch (error) {
      console.error("Error saving mood: ", error);
    }
  };

  if (loading) {
    return <div className="mood-tracker-container">Loading moods...</div>;
  }

  return (
    <div className="mood-tracker-container">
      <h3 className="mood-title">How are you feeling today?</h3>
      <div className="mood-emojis">
        {moods.map((mood) => (
          <button
            key={mood.label}
            className={`mood-emoji-btn ${selectedMood === mood.emoji ? 'selected' : ''}`}
            onClick={() => handleMoodSelect(mood)}
          >
            <span role="img" aria-label={mood.label}>{mood.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;
