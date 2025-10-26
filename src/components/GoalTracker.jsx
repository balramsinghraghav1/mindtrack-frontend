import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import './GoalTracker.css';

const MAX_STREAK_FOR_GOAL = 500; // As you specified

const GoalTracker = ({ totalStreak }) => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [loading, setLoading] = useState(true);

  // Load goals from Firebase
  useEffect(() => {
    const loadGoals = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'goals'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGoals(goalsData);
      } catch (error) {
        console.error('Error loading goals:', error);
      }
      setLoading(false);
    };

    loadGoals();
  }, [currentUser]);

  // Add a new goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newGoalName.trim() || !currentUser) return;

    try {
      const goalData = {
        name: newGoalName.trim(),
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'goals'), goalData);
      setGoals([{ id: docRef.id, ...goalData }, ...goals]);
      setNewGoalName('');
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };
  
  // Delete a goal
  const deleteGoal = async (goalId) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // Calculate progress
  const progressPercentage = Math.min((totalStreak / MAX_STREAK_FOR_GOAL) * 100, 100);

  return (
    <div className="goal-tracker-container glass-card">
      <h2 className="goal-title">Your Goals</h2>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="goal-form">
        <input
          type="text"
          className="neon-input"
          value={newGoalName}
          onChange={(e) => setNewGoalName(e.target.value)}
          placeholder="Enter a new goal and press Enter..."
        />
      </form>

      {/* List of Goals */}
      <div className="goals-list">
        {loading && <p>Loading goals...</p>}
        {!loading && goals.length === 0 && <p className="no-goals-text">No goals set yet. Add one above!</p>}
        
        {goals.map((goal) => (
          <div key={goal.id} className="goal-item">
            <div className="goal-info">
              <span className="goal-name">{goal.name}</span>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <button onClick={() => deleteGoal(goal.id)} className="delete-goal-btn">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;
