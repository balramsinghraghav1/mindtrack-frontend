import Calendar from '../components/Calendar'; // Keep the Calendar import
import AIChatbot from '../components/AIChatbot';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Plus,
  Check,
  Trash2,
  LogOut,
  Flame,
  Sparkles,
  Calendar as CalendarIcon, // Keep CalendarIcon for the stats card
  UserCircle // New icon for user profile
} from 'lucide-react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

// --- NEW IMPORTS ---
import Motivation from '../components/Motivation';
import GoalTracker from '../components/GoalTracker';
import MoodTracker from '../components/MoodTracker';
import TrendChart from '../components/TrendChart'; // NEW
import StreakRewards from '../components/StreakRewards'; // NEW
// --- END NEW IMPORTS ---

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { currentUser, userName, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadHabits();
    }
  }, [currentUser]);

  async function loadHabits() {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      habitsData.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
    setLoading(false);
  }

  async function addHabit(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const habitData = {
        name: newHabit,
        userId: currentUser.uid,
        completedDates: [],
        streak: 0,
        createdAt: new Date().toISOString()
      };
      

      const docRef = await addDoc(collection(db, 'habits'), habitData);
      // Add new habit to the beginning of the list for fresh display
      setHabits([ { id: docRef.id, ...habitData }, ...habits ]);
      setNewHabit('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }

  async function addHabitFromAI(habitName) {
    try {
      const habitData = {
        name: habitName,
        userId: currentUser.uid,
        completedDates: [],
        streak: 0,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'habits'), habitData);
      // Add new habit to the beginning of the list for fresh display
      setHabits([ { id: docRef.id, ...habitData }, ...habits ]);
    } catch (error) {
      console.error('Error adding habit from AI:', error);
    }
  }

  async function toggleHabit(habit) {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates?.includes(today);
    
    let newCompletedDates;
    let newStreak = habit.streak || 0;

    if (isCompletedToday) {
      newCompletedDates = habit.completedDates.filter(date => date !== today);
      newStreak = Math.max(0, newStreak - 1);
    } else {
      newCompletedDates = [...(habit.completedDates || []), today];
      newStreak = calculateStreak(newCompletedDates);
    }

    try {
      const habitRef = doc(db, 'habits', habit.id);
      await updateDoc(habitRef, {
        completedDates: newCompletedDates,
        streak: newStreak
      });

      setHabits(habits.map(h => 
        h.id === habit.id 
          ? { ...h, completedDates: newCompletedDates, streak: newStreak }
          : h
      ));
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }

  function calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;
    
    // Ensure dates are sorted for correct streak calculation
    const sorted = [...dates].sort(); 
    let currentStreak = 0;
    let lastDate = null;

    for (let i = sorted.length - 1; i >= 0; i--) {
        const currentDate = new Date(sorted[i]);
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1); // Day after current date

        // Check if the next expected day is today or if it's a consecutive day
        if (lastDate === null || lastDate.toISOString().split('T')[0] === nextDay.toISOString().split('T')[0]) {
            currentStreak++;
            lastDate = currentDate;
        } else {
            break; // Streak broken
        }
    }
    return currentStreak;
}


  async function deleteHabit(habitId) {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  if (loading) {
    return (
      <div className="black-bg" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="loading-wave">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    // Changed black-bg to container, as global CSS will handle bg
    <div className="container" style={{ minHeight: '100vh', padding: '2rem 1.5rem' }}>
      
      {/* Top Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ marginBottom: '2rem', padding: '1.5rem 2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700',
              color: var('--text-color-primary'),
              margin: 0,
              lineHeight: 1.3
            }}>
              Small steps every day.<br/>You've got this!
            </h1>
            {/* <p style={{ color: var('--text-color-secondary'), marginTop: '0.25rem', fontSize: '0.95rem' }}>
              {userName || currentUser?.email}
            </p> */}
          </div>
          <UserCircle size={48} color={var('--accent-green')} /> {/* Profile Icon */}
        </div>

        {/* Habits Section (New UI style) */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: var('--text-color-primary'), margin: 0 }}>Habits</h2>
            <div className="streak-badge"> {/* Reusing streak badge style for total days */}
              <Flame size={16} /> {totalStreak} Days
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {/* Example suggested habits - could be dynamic or from AI chatbot suggestions */}
            <button className="neon-button-light">
              <Activity size={20} style={{ marginRight: '8px' }} /> Exerc
            </button>
            <button className="neon-button-light">
              <Sparkles size={20} style={{ marginRight: '8px' }} /> Read
            </button>
            {/* Add more as needed */}

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="neon-button" // Primary green button
              >
                <Plus size={20} style={{ marginRight: '8px' }} />
                Add Habit
              </button>
            ) : (
              // Form for adding new habit
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="add-habit-form" // New class for form styling
                onSubmit={addHabit}
                style={{ width: '100%', display: 'flex', gap: '0.5rem' }}
              >
                <input
                  type="text"
                  className="neon-input" // Reusing styled input
                  placeholder="e.g., Meditate for 10 minutes"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  autoFocus
                  style={{ flexGrow: 1 }}
                />
                <button type="submit" className="neon-button" style={{ width: 'auto', padding: '0.8rem 1rem' }}>
                  <Check size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewHabit(''); }}
                  className="secondary-button" // Muted cancel button
                  style={{ width: 'auto', padding: '0.8rem 1rem' }}
                >
                  <Trash2 size={20} />
                </button>
              </motion.form>
            )}
          </div>
        </div>

        {/* Moods Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: var('--text-color-primary'), margin: '0 0 1rem 0' }}>Moods</h2>
          <MoodTracker /> {/* MoodTracker is already self-contained */}
        </div>

      </motion.div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Left Column (Calendar and Reminders/Goals) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Calendar habits={habits} /> {/* Calendar now has its own unique style */}

          {/* Goal Tracker (styled to fit the new look) */}
          <GoalTracker totalStreak={totalStreak} /> 
        </div>

        {/* Right Column (Trend and Streak Rewards) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TrendChart /> {/* NEW: Trend Chart */}
          <StreakRewards totalStreak={totalStreak} /> {/* NEW: Streak Rewards */}
        </div>
      </div>
      
      {/* Habits List (Your existing habit list) - Positioned below the main 2-column layout or where it makes sense */}
      <AnimatePresence>
          {habits.length === 0 && !showForm ? ( // Only show empty state if no habits AND form isn't open
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{ textAlign: 'center', padding: '3rem', marginTop: '1.5rem' }}
            >
              <Sparkles size={64} color={var('--accent-green')} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ 
                fontSize: '1.75rem', 
                marginBottom: '0.75rem',
                color: var('--text-color-primary'),
                fontWeight: '700'
              }}>
                Start Your Rhythm
              </h3>
              <p style={{ color: var('--text-color-secondary'), fontSize: '1.05rem' }}>
                Create your first habit to sync with your bio rhythm
              </p>
            </motion.div>
          ) : (
            // Habit list
            <div style={{ marginTop: '1.5rem' }}>
              {habits.map((habit, index) => {
                const isCompletedToday = habit.completedDates?.includes(today);
                
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="habit-card" // Reusing glass-card style for habits
                  >
                    <div
                      className={`habit-checkbox ${isCompletedToday ? 'checked' : ''}`}
                      onClick={() => toggleHabit(habit)}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        textDecoration: isCompletedToday ? 'line-through' : 'none',
                        opacity: isCompletedToday ? 0.7 : 1,
                        color: var('--text-color-primary')
                      }}>
                        {habit.name}
                      </h3>
                      {habit.streak > 0 && (
                        <div className="streak-badge">
                          <Flame size={16} />
                          <span>{habit.streak} day streak</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="delete-button" // New class for delete
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
      </AnimatePresence>

      {/* AI Chatbot - remains at the bottom, or consider integrating differently */}
      <AIChatbot 
        currentHabits={habits.map(h => h.name)}
        onAddHabit={addHabitFromAI}
      />
    </div>
  );
}

