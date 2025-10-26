import React, { useState } from 'react';
import './GoalTracker.css'; // We'll create this file

// We assume you pass the user's totalStreak as a prop to this component
const GoalTracker = ({ totalStreak }) => {
  const [goals, setGoals] = useState([]); // In a real app, you'd fetch/save this with Firebase
  const [newGoalName, setNewGoalName] = useState('');

  const maxStreakForFullBar = 500; // As you specified

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newGoalName.trim() === '') return;
    
    // Add new goal. You would also save this to Firebase here.
    setGoals([...goals, { name: newGoalName }]);
    setNewGoalName('');
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((totalStreak / maxStreakForFullBar) * 100, 100);

  return (
    <div className="goal-tracker-container">
      <h3>Your Goals</h3>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="goal-form">
        <input
          type="text"
          value={newGoalName}
          onChange={(e) => setNewGoalName(e.target.value)}
          placeholder="Enter a new goal and press Enter"
        />
      </form>

      {/* List of Goals */}
      <div className="goals-list">
        {goals.length === 0 && <p>No goals set yet. Add one!</p>}
        
        {goals.map((goal, index) => (
          <div key={index} className="goal-item">
            <span className="goal-name">{goal.name}</span>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;
