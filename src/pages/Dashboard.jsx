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
  Target, // Goal Icon
  Zap, // Goal Input Icon
  Clock, // Timeline Icon
  Pencil, // Edit Icon
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

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHabitForm, setShowHabitForm] = useState(false);
  
  // Goal States
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [newGoalStartDate, setNewGoalStartDate] = useState('');
  const [newGoalEndDate, setNewGoalEndDate] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null); // New: Stores the goal being edited { id, name, startDate, endDate }

  // Habit States
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [editingHabit, setEditingHabit] = useState(null); // New: Stores the habit being edited { id, name, goalId }
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadHabits();
      loadGoals();
      setNewGoalStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [currentUser]);

  // --- GOAL CRUD FUNCTIONS (Modified) ---

  async function loadGoals() {
    // ... (unchanged)
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'goals'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const goalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      goalsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }

  async function addGoal(e) {
    e.preventDefault();
    if (!newGoal.trim() || !newGoalStartDate || !newGoalEndDate) return;
    
    if (new Date(newGoalStartDate) > new Date(newGoalEndDate)) {
      alert("Goal End Date cannot be before the Start Date!");
      return;
    }

    try {
      const goalData = {
        name: newGoal,
        userId: currentUser.uid,
        startDate: newGoalStartDate,
        endDate: newGoalEndDate,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'goals'), goalData);
      const newGoalWithId = { id: docRef.id, ...goalData };
      setGoals([newGoalWithId, ...goals]);
      
      // Reset form fields
      setNewGoal('');
      setNewGoalEndDate('');
      setNewGoalStartDate(new Date().toISOString().split('T')[0]);
      setShowGoalForm(false);
      setSelectedGoalId(newGoalWithId.id); 
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  }
  
  // NEW FUNCTION: Handles goal update
  async function updateGoal(e) {
      e.preventDefault();
      if (!editingGoal || !editingGoal.name.trim() || !editingGoal.startDate || !editingGoal.endDate) return;

      if (new Date(editingGoal.startDate) > new Date(editingGoal.endDate)) {
          alert("Goal End Date cannot be before the Start Date!");
          return;
      }

      try {
          const goalRef = doc(db, 'goals', editingGoal.id);
          const updatedData = {
              name: editingGoal.name,
              startDate: editingGoal.startDate,
              endDate: editingGoal.endDate
          };

          await updateDoc(goalRef, updatedData);

          // Update local state
          setGoals(goals.map(g => 
              g.id === editingGoal.id ? { ...g, ...updatedData } : g
          ));

          setEditingGoal(null); // Exit edit mode
      } catch (error) {
          console.error('Error updating goal:', error);
      }
  }

  // Helper to enter goal edit mode
  const startGoalEdit = (goal) => {
      setEditingGoal({ ...goal });
      setShowGoalForm(false); // Hide the Add form if open
  };

  // --- HABIT CRUD FUNCTIONS (Modified) ---

  async function loadHabits() {
    // ... (unchanged)
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
    // ... (unchanged)
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const habitData = {
        name: newHabit,
        userId: currentUser.uid,
        completedDates: [],
        streak: 0,
        goalId: selectedGoalId || null,
        createdAt: new Date().toISOString()
      };
      

      const docRef = await addDoc(collection(db, 'habits'), habitData);
      setHabits([{ id: docRef.id, ...habitData }, ...habits]);
      setNewHabit('');
      setSelectedGoalId('');
      setShowHabitForm(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }

  // NEW FUNCTION: Handles habit update
  async function updateHabit(e) {
      e.preventDefault();
      if (!editingHabit || !editingHabit.name.trim()) return;

      try {
          const habitRef = doc(db, 'habits', editingHabit.id);
          const updatedData = {
              name: editingHabit.name,
              goalId: editingHabit.goalId || null,
          };

          await updateDoc(habitRef, updatedData);

          // Update local state
          setHabits(habits.map(h => 
              h.id === editingHabit.id ? { ...h, name: updatedData.name, goalId: updatedData.goalId } : h
          ));

          setEditingHabit(null); // Exit edit mode
      } catch (error) {
          console.error('Error updating habit:', error);
      }
  }

  // Helper to enter habit edit mode
  const startHabitEdit = (habit) => {
      setEditingHabit({ id: habit.id, name: habit.name, goalId: habit.goalId || '' });
      setShowHabitForm(false); // Hide the Add form if open
  };

  async function toggleHabit(habit) {
    // ... (unchanged)
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates?.includes(today);
    
    let newCompletedDates;
    let newStreak = habit.streak || 0;

    if (isCompletedToday) {
      newCompletedDates = habit.completedDates.filter(date => date !== today);
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
    // ... (unchanged)
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
    // ... (unchanged)
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

  const getGoalData = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    return goal 
      ? { name: goal.name, startDate: goal.startDate, endDate: goal.endDate } 
      : { name: 'No Goal Linked', startDate: null, endDate: null };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };


  return (
    <div className="black-bg">
      <div className="container" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
        
        {/* Header and Stats (omitted for brevity) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ marginBottom: '2rem' }}
        >
          {/* ... Header Content ... */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Activity size={48} color="#9333ea" className="pulse-icon" />
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  Your Pulse
                </h1>
                <p style={{ color: '#a1a1aa', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                  {currentUser?.email}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="neon-button">
              <LogOut size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Logout
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div className="stats-card">
              <Check size={28} color="#10b981" />
              <div className="stats-card-value">{completedToday}/{habits.length}</div>
              <div className="stats-card-label">Today</div>
            </div>
            
            <div className="stats-card">
              <Flame size={28} color="#ec4899" />
              <div className="stats-card-value">{totalStreak}</div>
              <div className="stats-card-label">Total Streak</div>
            </div>

            <div className="stats-card">
              <CalendarIcon size={28} color="#06b6d4" />
              <div className="stats-card-value">{habits.length}</div>
              <div className="stats-card-label">Active Habits</div>
            </div>

            <div className="stats-card">
              <Target size={28} color="#f59e0b" />
              <div className="stats-card-value">{goals.length}</div>
              <div className="stats-card-label">Active Goals</div>
            </div>
          </div>
        </motion.div>
        
        {/* Calendar (omitted for brevity) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          
          <Calendar habits={habits} />
        </motion.div>

        {/* --- GOAL EDIT FORM --- */}
        <AnimatePresence>
            {editingGoal && (
                <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card"
                    onSubmit={updateGoal}
                    style={{ marginBottom: '1.5rem', border: '2px solid #f59e0b' }}
                >
                    <h4 style={{color: '#f59e0b', marginBottom: '1rem', fontWeight: 600}}>
                        <Pencil size={18} style={{marginRight: '8px'}} /> Edit Goal: {editingGoal.name}
                    </h4>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            className="neon-input"
                            value={editingGoal.name}
                            onChange={(e) => setEditingGoal({...editingGoal, name: e.target.value})}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Start Date</label>
                            <input
                                type="date"
                                className="neon-input"
                                value={editingGoal.startDate}
                                onChange={(e) => setEditingGoal({...editingGoal, startDate: e.target.value})}
                                required
                                style={{padding: '0.8rem'}}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Target End Date</label>
                            <input
                                type="date"
                                className="neon-input"
                                value={editingGoal.endDate}
                                onChange={(e) => setEditingGoal({...editingGoal, endDate: e.target.value})}
                                required
                                style={{padding: '0.8rem'}}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="neon-button" style={{ flex: 1, backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                            <Check size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditingGoal(null)}
                            className="secondary-button"
                            style={{ flex: 1 }}
                        >
                            Cancel Edit
                        </button>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>


        {/* --- ADD GOAL SECTION (Hidden when editing) --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '1.5rem', display: editingGoal ? 'none' : 'block' }}
        >
          {!showGoalForm ? (
             // ... (Add Goal Button)
            <button
              onClick={() => setShowGoalForm(true)}
              className="secondary-button"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderColor: '#f59e0b' }}
            >
              <Target size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Add New Goal
            </button>
          ) : (
            // ... (Add Goal Form)
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              onSubmit={addGoal}
            >
              <h4 style={{color: '#f59e0b', marginBottom: '1rem', fontWeight: 600}}>Create a Time-bound Goal</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="neon-input"
                  placeholder="Goal Name (e.g., Master JavaScript Fundamentals)"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Start Date</label>
                  <input
                    type="date"
                    className="neon-input"
                    value={newGoalStartDate}
                    onChange={(e) => setNewGoalStartDate(e.target.value)}
                    required
                    style={{padding: '0.8rem'}}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Target End Date</label>
                  <input
                    type="date"
                    className="neon-input"
                    value={newGoalEndDate}
                    onChange={(e) => setNewGoalEndDate(e.target.value)}
                    required
                    style={{padding: '0.8rem'}}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="neon-button" style={{ flex: 1, backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                  <Zap size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Set Goal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalForm(false);
                    setNewGoal('');
                    setNewGoalEndDate('');
                  }}
                  className="secondary-button"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>


        {/* --- HABIT EDIT FORM --- */}
        <AnimatePresence>
            {editingHabit && (
                <motion.form
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card"
                    onSubmit={updateHabit}
                    style={{ marginBottom: '1.5rem', border: '2px solid #9333ea' }}
                >
                    <h4 style={{color: '#9333ea', marginBottom: '1rem', fontWeight: 600}}>
                         <Pencil size={18} style={{marginRight: '8px'}} /> Edit Habit: {editingHabit.name}
                    </h4>
                    
                    {/* Habit Name Input */}
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            className="neon-input"
                            value={editingHabit.name}
                            onChange={(e) => setEditingHabit({...editingHabit, name: e.target.value})}
                            autoFocus
                        />
                    </div>

                    {/* Goal Selection Dropdown */}
                    <div style={{ marginBottom: '1rem' }}>
                        <select
                            className="neon-input"
                            value={editingHabit.goalId}
                            onChange={(e) => setEditingHabit({...editingHabit, goalId: e.target.value})}
                            style={{ width: '100%', color: editingHabit.goalId ? 'white' : '#a1a1aa' }}
                        >
                            <option value="">No Goal</option>
                            {goals.map(goal => (
                                <option key={goal.id} value={goal.id}>
                                    {'$goal.name} (${formatDate(goal.startDate)} - ${formatDate(goal.endDate)})'}
                                </option>
                                
                            ))}
                        </select>
                    </div>
                    {/* End Goal Selection Dropdown */}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="neon-button" style={{ flex: 1 }}>
                            <Check size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditingHabit(null)}
                            className="secondary-button"
                            style={{ flex: 1 }}
                        >
                            Cancel Edit
                        </button>
                    </div>
                </motion.form>
            )}
        </AnimatePresence>


        {/* --- ADD HABIT SECTION (Hidden when editing) --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '1.5rem', display: editingHabit ? 'none' : 'block' }}
        >
          {!showHabitForm ? (
            // ... (Add Habit Button)
            <button
              onClick={() => setShowHabitForm(true)}
              className="neon-button"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              <Plus size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Add New Habit (Activity)
            </button>
          ) : (
            // ... (Add Habit Form)
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              onSubmit={addHabit}
            >
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="neon-input"
                  placeholder="e.g., Meditate for 10 minutes"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <select
                  className="neon-input"
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  style={{ width: '100%', color: selectedGoalId ? 'white' : '#a1a1aa' }}
                >
                  <option value="" disabled={!!selectedGoalId}>--- Select a Goal to Link (Optional) ---</option>
                  <option value="">No Goal</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                        {'$goal.name} (${formatDate(goal.startDate)} - ${formatDate(goal.endDate)})'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="neon-button" style={{ flex: 1 }}>
                  <Sparkles size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Create Habit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHabitForm(false);
                    setNewHabit('');
                    setSelectedGoalId('');
                  }}
                  className="secondary-button"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>

        {/* Habits List (Modified to include Edit Button) */}
        <AnimatePresence>
          {habits.length === 0 ? (
            // ... (Empty state)
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
              style={{ textAlign: 'center', padding: '3rem' }}
            >
              <Sparkles size={64} color="#9333ea" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ 
                fontSize: '1.75rem', 
                marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700'
              }}>
                Start Your Rhythm
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '1.05rem' }}>
                Create your first habit to sync with your bio rhythm
              </p>
            </motion.div>
          ) : (
            habits.map((habit, index) => {
              const isCompletedToday = habit.completedDates?.includes(today);
              const goalData = getGoalData(habit.goalId);
              
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
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      {habit.name}
                    </h3>
                    
                    {/* Goal Info */}
                    <div style={{
                        fontSize: '0.85rem',
                        color: goalData.name === 'No Goal Linked' ? '#71717a' : '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                    }}>
                        <Target size={14} />
                        <span>{goalData.name}</span>
                    </div>
                    
                    {/* Timeline Info */}
                    {goalData.startDate && goalData.endDate && (
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#a1a1aa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <Clock size={14} />
                        <span>{formatDate(goalData.startDate)} - {formatDate(goalData.endDate)}</span>
                      </div>
                    )}

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

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Edit Habit Button */}
                    <button
                        onClick={() => startHabitEdit(habit)}
                        className="control-button"
                        title="Edit Habit"
                        style={{
                            background: 'rgba(147, 51, 234, 0.2)', // Purple tint
                            border: '1px solid rgba(147, 51, 234, 0.4)',
                            color: '#d8b4fe',
                        }}
                    >
                        <Pencil size={20} />
                    </button>

                    {/* Delete Habit Button (existing) */}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="control-button"
                      title="Delete Habit"
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* --- GOALS LIST (NEW SECTION) --- */}
        <div className="glass-card" style={{ marginTop: '2rem' }}>
            <h2 style={{
                fontSize: '1.5rem', 
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700'
            }}>
                Your Active Goals
            </h2>
            <AnimatePresence>
                {goals.map(goal => (
                    <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="habit-card"
                        style={{ padding: '15px', marginBottom: '10px' }}
                    >
                        <div style={{ flex: 1 }}>
                            <h4 style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '0.25rem' }}>
                                <Target size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                {goal.name}
                            </h4>
                            <div style={{ color: '#a1a1aa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} />
                                <span>{formatDate(goal.startDate)} - {formatDate(goal.endDate)}</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => startGoalEdit(goal)}
                            className="control-button"
                            title="Edit Goal"
                            style={{
                                background: 'rgba(245, 158, 11, 0.2)', // Yellow/Orange tint
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#fcd34d',
                            }}
                        >
                            <Pencil size={20} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
            {goals.length === 0 && (
                <p style={{color: '#a1a1aa', textAlign: 'center', padding: '1rem'}}>No goals set yet. Add one above!</p>
            )}
        </div>


      {/* AI Chatbot */}
      <AIChatbot 
        currentHabits={habits.map(h => h.name)}
        onAddHabit={addHabitFromAI}
      />
    </div>
  </div>  
  );
}