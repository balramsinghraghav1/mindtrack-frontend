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
  Target
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
import Calendar from '../components/Calendar';
import AIChatbot from '../components/AIChatbot';
import MotivationalQuote from '../components/dashboard/MotivationalQuote';
import MoodPicker from '../components/dashboard/MoodPicker';
import GoalModal from '../components/dashboard/GoalModal';
import TrendBar from '../components/dashboard/TrendBar';
import SuccessAnimation from '../components/dashboard/SuccessAnimation';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { currentUser, userName, logout } = useAuth();
  const [displayName, setDisplayName] = useState(userName);
  const navigate = useNavigate();

  useEffect(() => {
    setDisplayName(userName);
  }, [userName]);

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
      setHabits([{ id: docRef.id, ...habitData }, ...habits]);
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
      setHabits([{ id: docRef.id, ...habitData }, ...habits]);
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
    
    const sorted = [...dates].sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
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
  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  if (loading) {
    return (
      <div className="nature-bg" style={{ 
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
    <div className="nature-bg">
      {/* Motivational Quote Toast */}
      <MotivationalQuote />

      {/* Success Animation */}
      {showSuccess && <SuccessAnimation onComplete={() => setShowSuccess(false)} />}

      <div className="container" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Activity size={48} color="#fbbf24" className="pulse-icon" />
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #fbbf24, #84cc16)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  Your Pulse
                </h1>
                <p style={{ color: '#78716c', marginTop: '0.25rem', fontSize: '0.95rem', fontWeight: '500' }}>
                  {displayName || currentUser?.email}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="energy-button">
              <LogOut size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Logout
            </button>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div className="stats-card">
              <Check size={28} color="#84cc16" />
              <div className="stats-card-value">{completedToday}/{habits.length}</div>
              <div className="stats-card-label">Today</div>
            </div>
            
            <div className="stats-card">
              <Flame size={28} color="#fbbf24" />
              <div className="stats-card-value">{totalStreak}</div>
              <div className="stats-card-label">Total Streak</div>
            </div>

            <div className="stats-card">
              <CalendarIcon size={28} color="#84cc16" />
              <div className="stats-card-value">{habits.length}</div>
              <div className="stats-card-label">Active Habits</div>
            </div>
          </div>
        </motion.div>

        {/* Mood Picker */}
        <MoodPicker userId={currentUser.uid} />

        {/* Trend Bar */}
        <TrendBar habits={habits} />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}
        >
          <button
            onClick={() => setShowForm(true)}
            className="energy-button"
            style={{ padding: '1rem', fontSize: '1.05rem' }}
          >
            <Plus size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Add Habit
          </button>
          <button
            onClick={() => setShowGoalModal(true)}
            className="growth-button"
            style={{ padding: '1rem', fontSize: '1.05rem' }}
          >
            <Target size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Set Goal
          </button>
        </motion.div>

        {/* Add Habit Form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            onSubmit={addHabit}
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                className="nature-input"
                placeholder="e.g., Morning meditation for 10 minutes"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="energy-button" style={{ flex: 1 }}>
                <Sparkles size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewHabit('');
                }}
                className="secondary-button"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Calendar habits={habits} />
        </motion.div>

        {/* Habits List */}
        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#1c1917'
          }}>
            Your Habits
          </h2>
          
          <AnimatePresence>
            {habits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card"
                style={{ textAlign: 'center', padding: '3rem' }}
              >
                <Sparkles size={64} color="#fbbf24" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  marginBottom: '0.75rem',
                  background: 'linear-gradient(135deg, #fbbf24, #84cc16)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '700'
                }}>
                  Start Your Growth Journey
                </h3>
                <p style={{ color: '#78716c', fontSize: '1.05rem' }}>
                  Create your first habit and watch your progress bloom 🌱
                </p>
              </motion.div>
            ) : (
              habits.map((habit, index) => {
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
                        color: '#1c1917'
                      }}>
                        {habit.name}
                      </h3>
                      {habit.streak > 0 && (
                        <div className="streak-badge" style={{ 
                          display: 'inline-flex',
                          marginTop: '0.5rem'
                        }}>
                          <Flame size={16} />
                          <span>{habit.streak} day streak</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '10px',
                        cursor: 'pointer',
                        color: '#dc2626',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Goal Modal */}
      <GoalModal 
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        userId={currentUser.uid}
        onSuccess={() => {
          setShowGoalModal(false);
          setShowSuccess(true);
        }}
      />

      {/* AI Chatbot */}
      <AIChatbot 
        currentHabits={habits.map(h => h.name)}
        onAddHabit={addHabitFromAI}
      />
    </div>
  );
}


