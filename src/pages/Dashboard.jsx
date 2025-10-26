import AIHabitSuggester from '../components/AIHabitSuggester';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Trash2, 
  LogOut, 
  Flame,
  Sparkles,
  Calendar
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadHabits();
  }, [currentUser]);

  async function loadHabits() {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
    setLoading(false);
  }

  async function addHabit(e) {
    // Add this line near where 'today' is defined for toggleHabit/stats, or inside the functions
    const today = new Date().toISOString().split('T')[0];
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const habitData = {
        name: newHabit,
        userId: currentUser.uid,
        completedDates: [today],
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
    
    const sorted = dates.sort().reverse();
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
      <div className="water-bg" style={{ 
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
{/* AI Suggester */}
<AIHabitSuggester 
  currentHabits={habits.map(h => h.name)}
  onAddHabit={async (habitName) => {
    const habitData = {
      name: habitName,
      userId: currentUser.uid,
      completedDates: [today],
      streak: 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'habits'), habitData);
    setHabits([{ id: docRef.id, ...habitData }, ...habits]);
  }}
/>
  return (
    <div className="water-bg">
      <div className="container" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>
                Your Habits
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>
                {currentUser.email}
              </p>
            </div>
            <button onClick={handleLogout} className="water-button">
              <LogOut size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Logout
            </button>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ 
              background: 'rgba(0, 201, 167, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Check size={24} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {completedToday}/{habits.length}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Today</div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 107, 107, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Flame size={24} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {totalStreak}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Total Streak</div>
            </div>

            <div style={{ 
              background: 'rgba(125, 211, 252, 0.2)',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Calendar size={24} style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {habits.length}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Active Habits</div>
            </div>
          </div>
        </motion.div>

        {/* Add Habit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '1.5rem' }}
        >
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="water-button"
              style={{ width: '100%', padding: '1rem' }}
            >
              <Plus size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Add New Habit
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              onSubmit={addHabit}
            >
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="water-input"
                  placeholder="e.g., Drink 8 glasses of water"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="water-button" style={{ flex: 1 }}>
                  <Sparkles size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setNewHabit('');
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>

        {/* Habits List */}
        <AnimatePresence>
          {habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{ textAlign: 'center', padding: '3rem' }}
            >
              <Sparkles size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                Start Your Journey
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Create your first habit to begin tracking your progress
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
                      opacity: isCompletedToday ? 0.7 : 1
                    }}>
                      {habit.name}
                    </h3>
                    {habit.streak > 0 && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <Flame size={16} color="#FFD93D" />
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: 'rgba(255, 255, 255, 0.8)' 
                        }}>
                          {habit.streak} day streak
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    style={{
                      background: 'rgba(255, 107, 107, 0.2)',
                      border: '1px solid rgba(255, 107, 107, 0.4)',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#FFB3B3',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 107, 107, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
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
  );
}
