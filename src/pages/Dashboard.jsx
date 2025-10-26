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
  UserCircle
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

// --- (Other component imports are the same) ---
import Motivation from '../components/Motivation';
import GoalTracker from '../components/GoalTracker';
import MoodTracker from '../components/MoodTracker';
import TrendChart from '../components/TrendChart'; 
import StreakRewards from '../components/StreakRewards'; 

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { currentUser, userName, logout } = useAuth();
  const navigate = useNavigate();

  // --- NEW STATE ADDITIONS FOR GOALS ---
  const [goals, setGoals] = useState([]); // To store the user's defined goals
  const [newHabitGoal, setNewHabitGoal] = useState(''); // Input for the goal name when adding a new habit
  // -------------------------------------
  
  // Define today's date string consistently for habit tracking/creation
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    if (currentUser) {
      loadHabits();
      loadGoals(); // <--- NEW: Load goals on mount
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

  // --- NEW: Load Goals Function ---
  async function loadGoals() {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().name || 'Unnamed Goal',
      }));
      setGoals(goalsData);
      
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }
  // --------------------------------

  // --- MODIFIED: addHabit with Goal Linkage and Today's Completion Fix ---
  async function addHabit(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const habitData = {
        name: newHabit,
        userId: currentUser.uid,
        completedDates: [today], // <-- FIX: Habit completed today on creation
        streak: 1, // <-- FIX: Initial streak is 1
        createdAt: new Date().toISOString(),
        goalName: newHabitGoal.trim() || 'Uncategorized', // <-- NEW: Link to goal
      };
      
      const docRef = await addDoc(collection(db, 'habits'), habitData);
      // Add new habit to the beginning of the list for fresh display
      setHabits([ { id: docRef.id, ...habitData }, ...habits ]);
      setNewHabit('');
      setNewHabitGoal(''); // <-- Clear goal input
      setShowForm(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }
  // -----------------------------------------------------------------------

  // --- MODIFIED: addHabitFromAI with Today's Completion Fix and Goal Placeholder ---
  async function addHabitFromAI(habitName) {
    try {
      const habitData = {
        name: habitName,
        userId: currentUser.uid,
        completedDates: [today], // <-- FIX: Habit completed today on creation
        streak: 1, // <-- FIX: Initial streak is 1
        createdAt: new Date().toISOString(),
        goalName: 'AI Suggestion', // <-- NEW: Default goal name for AI-added habits
      };

      const docRef = await addDoc(collection(db, 'habits'), habitData);
      // Add new habit to the beginning of the list for fresh display
      setHabits([ { id: docRef.id, ...habitData }, ...habits ]);
    } catch (error) {
      console.error('Error adding habit from AI:', error);
    }
  }
  // ---------------------------------------------------------------------------------

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
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Normalize today
    
    let startDate = new Date(todayDate); // Start checking from today
    const todayStr = todayDate.toISOString().split('T')[0];

    if (sortedDates.length > 0 && sortedDates[0] === todayStr) {
      // Streak includes today, start counting from today
      startDate = new Date(todayDate);
    } else {
      // Today is not completed, check if yesterday was
      const yesterday = new Date(todayDate);
      yesterday.setDate(todayDate.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (sortedDates.length > 0 && sortedDates[0] === yesterdayStr) {
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

  const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);


  if (loading) {
    return (
      <div style={{ 
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
              Small steps every day.
            </h1>
            {/* --- NAME ADDED HERE --- */}
            <p style={{ 
              color: 'var(--text-color-secondary)', 
              marginTop: '0.25rem', 
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              You've got this, {userName || 'User'}!
            </p>
          </div>
          
          {/* --- LOGOUT BUTTON ADDED HERE --- */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <UserCircle size={48} color='var(--accent-green)' />
            <button
              onClick={handleLogout}
              className="delete-button" // Re-using delete-button style for a subtle look
              title="Logout"
              style={{ 
                color: 'var(--text-color-secondary)',
                background: 'rgba(0,0,0,0.05)',
                padding: '0.75rem'
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
          {/* --- END OF ADDITIONS --- */}

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
            <button className="neon-button-light">
              <Activity size={20} style={{ marginRight: '8px' }} /> Exercise
            </button>
            <button className="neon-button-light">
              <Sparkles size={20} style={{ marginRight: '8px' }} /> Read
            </button>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="neon-button" 
              >
                <Plus size={20} style={{ marginRight: '8px' }} />
                Add Habit
              </button>
            ) : (
              {/* --- MODIFIED HABIT ADDITION FORM WITH GOAL SELECTOR --- */}
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="add-habit-form" 
                onSubmit={addHabit}
                style={{ flexDirection: 'column', gap: '10px' }} // Adjusted style for new layout
              >
                {/* Habit Input Row */}
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <input
                    type="text"
                    className="neon-input" 
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
                    onClick={() => { setShowForm(false); setNewHabit(''); setNewHabitGoal(''); }} // Clear both inputs
                    className="secondary-button" 
                    style={{ width: 'auto', padding: '0.8rem 1rem' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Goal Input/Selector */}
                {goals.length > 0 ? (
                  <select
                    className="neon-input"
                    value={newHabitGoal}
                    onChange={(e) => setNewHabitGoal(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">--- Link to a Goal (Optional) ---</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.name}>
                        {goal.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="neon-input"
                    placeholder="Create or link a Goal (e.g., 'Learn to code')"
                    value={newHabitGoal}
                    onChange={(e) => setNewHabitGoal(e.target.value)}
                    style={{ width: '100%' }}
                  />
                )}
              </motion.form>
            )}
          </div>
        </div>

        {/* Moods Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-color-primary)', margin: '0 0 1rem 0' }}>Moods</h2>
          <MoodTracker /> 
        </div>
        
        {/* Stats Grid */}
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

      {/* --- Main Dashboard Grid --- */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Calendar habits={habits} /> 
          <GoalTracker totalStreak={totalStreak} /> 
          <Motivation /> 
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* --- PASSED HABITS TO TRENDCHART --- */}
          <TrendChart habits={habits} /> 
          <StreakRewards totalStreak={totalStreak} /> 
        </div>
      </div>
      
      {/* Habits List */}
      <AnimatePresence>
          {habits.length === 0 && !showForm ? ( 
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
                    className="habit-card" 
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
                    {/* --- NEW: Display Goal Name --- */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {habit.streak > 0 && (
                          <div className="streak-badge">
                            <Flame size={16} />
                            <span>{habit.streak} day streak</span>
                          </div>
                        )}
                        {habit.goalName && habit.goalName !== 'Uncategorized' && (
                          <div className="streak-badge" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                            <Activity size={16} />
                            <span>{habit.goalName}</span>
                          </div>
                        )}
                    </div>
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="delete-button" 
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
