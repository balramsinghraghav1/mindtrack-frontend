import Calendar from '../components/Calendar';
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
  Calendar as CalendarIcon,
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
import TrendChart from '../components/TrendChart'; 
import StreakRewards from '../components/StreakRewards'; 
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
      // Re-calculate streak properly
      newStreak = calculateStreak(newCompletedDates);
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

    // Get unique, sorted dates in descending order
    const sortedDates = [...new Set(dates)].sort().reverse();
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today
    
    // Check if today is completed
    const todayStr = today.toISOString().split('T')[0];
    let startDate = new Date(today); // Start checking from today

    if (sortedDates[0] === todayStr) {
      // Streak includes today
      streak = 0; // Start counting from today
    } else {
      // Today is not completed, check if yesterday was
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (sortedDates[0] === yesterdayStr) {
        // Streak ended yesterday
        startDate.setDate(startDate.getDate() - 1); // Start checking from yesterday
      } else {
        // Streak is broken
        return 0; 
      }
    }

    // Loop through sorted dates to find consecutive days
    for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date(startDate);
        expectedDate.setDate(startDate.getDate() - i); // Day we expect
        
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        const actualDateStr = sortedDates[i];

        if (actualDateStr === expectedDateStr) {
            streak++; // It's a match, increment streak
        } else {
            break; // Streak is broken
        }
    }
    
    return streak;
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
  // --- FIX: Calculate Total Streak from individual habit streaks ---
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
              color: 'var(--text-color-primary)',
              margin: 0,
              lineHeight: 1.3
            }}>
              Small steps every day.<br/>You've got this!
            </h1>
          </div>
          <UserCircle size={48} color='var(--accent-green)' /> {/* Profile Icon */}
        </div>

        {/* Habits Section (New UI style) */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-color-primary)', margin: 0 }}>Habits</h2>
            <div className="streak-badge"> {/* Reusing streak badge style for total days */}
              <Flame size={16} /> {totalStreak} Days
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {/* Example suggested habits - could be dynamic or from AI chatbot suggestions */}
            <button className="neon-button-light">
              <Activity size={20} style={{ marginRight: '8px' }} /> Exercise
            </button>
            <button className="neon-button-light">
              <Sparkles size={20} style={{ marginRight: '8px' }} /> Read
            </button>

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-color-primary)', margin: '0 0 1rem 0' }}>Moods</h2>
          <MoodTracker /> {/* MoodTracker is already self-contained */}
        </div>
        
        {/* Stats Grid (from old design, now inside top card) */}
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div className="stats-card">
              <Check size={28} color="var(--accent-green)" />
              <div className="stats-card-value">{completedToday}/{habits.length}</div>
              <div className="stats-card-label">Today</div>
            </div>
            
            <div className="stats-card">
              <Flame size={28} color="var(--accent-orange)" />
              <div className="stats-card-value">{totalStreak}</div>
              <div className="stats-card-label">Total Streak</div>
            </div>

            <div className="stats-card">
              <CalendarIcon size={28} color="var(--accent-purple)" />
              <div className="stats-card-value">{habits.length}</div>
              <div className="stats-card-label">Active Habits</div>
            </div>
        </div>

      </motion.div>

      {/* --- FIX: APPLY THE NEW GRID CLASS --- */}
      <div className="dashboard-grid">
        {/* Left Column (Calendar and Reminders/Goals) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Calendar habits={habits} /> {/* Calendar now has its own unique style */}
          <GoalTracker totalStreak={totalStreak} /> 
          <Motivation /> {/* Moved Motivation here */}
        </div>

        {/* Right Column (Trend and Streak Rewards) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TrendChart /> {/* NEW: Trend Chart */}
          <StreakRewards totalStreak={totalStreak} /> {/* NEW: Streak Rewards */}
        </div>
      </div>
      
      {/* Habits List (Your existing habit list) */}
      <AnimatePresence>
          {habits.length === 0 && !showForm ? ( // Only show empty state if no habits AND form isn't open
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{ textAlign: 'center', padding: '3rem', marginTop: '1.5rem' }}
            >
              <Sparkles size={64} color='var(--accent-green)' style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ 
                fontSize: '1.75rem', 
                marginBottom: '0.75rem',
                color: 'var(--text-color-primary)',
                fontWeight: '700'
              }}>
                Start Your Rhythm
              </h3>
              <p style={{ color: 'var(--text-color-secondary)', fontSize: '1.05rem' }}>
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
                        color: 'var(--text-color-primary)'
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

      <AIChatbot 
        currentHabits={habits.map(h => h.name)}
        onAddHabit={addHabitFromAI}
      />
    </div>
  );
}
