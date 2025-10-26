import React, { useState, useEffect } from 'react';
import './MoodTracker.css';

// We assume you have a way to save/fetch data, e.g., from Firebase context
// import { useAuth } from '../context/AuthContext'; 
// import { db } from '../firebase/config';
// import { doc, setDoc, getDoc } from 'firebase/firestore';

const moods = ['😊', '😐', '😢', '😠', '🥳', '😴'];

const MoodTracker = () => {
  // const { currentUser } = useAuth(); // Example: Get user from context
  const [selectedMood, setSelectedMood] = useState(null); // 'null' means no mood selected today

  // --- This part is for saving/loading from Firebase ---
  // --- You can adapt this to your own Firebase setup ---

  /*
  // Load today's mood when component mounts
  useEffect(() => {
    const fetchMood = async () => {
      if (!currentUser) return;
      const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
      const moodDocRef = doc(db, 'users', currentUser.uid, 'moods', today);
      
      const docSnap = await getDoc(moodDocRef);
      if (docSnap.exists()) {
        setSelectedMood(docSnap.data().mood);
      }
    };
    fetchMood();
  }, [currentUser]);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    if (!currentUser) return;

    // Save to Firebase
    try {
      const today = new Date().toISOString().split('T')[0];
      const moodDocRef = doc(db, 'users', currentUser.uid, 'moods', today);
      await setDoc(moodDocRef, { mood: mood, timestamp: new Date() });
    } catch (error) {
      console.error("Error saving mood: ", error);
    }
  };
  */
  
  // --- END FIREBASE EXAMPLE ---

  // --- OFFLINE-ONLY VERSION (use this to test UI) ---
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    console.log("Mood selected:", mood); 
    // In real app, you'd save this to Firebase
  };
  // --- END OFFLINE VERSION ---


  return (
    <div className="mood-tracker-box">
      <h4>How are you feeling?</h4>
      <div className="mood-emojis">
        {moods.map((emoji) => (
          <button
            key={emoji}
            className={`mood-emoji-btn ${selectedMood === emoji ? 'selected' : ''}`}
            onClick={() => handleMoodSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;
