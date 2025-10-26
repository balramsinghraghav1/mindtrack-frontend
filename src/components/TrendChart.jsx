import React, { useState, useEffect } from 'react';
import './TrendChart.css'; // This will use the updated CSS

// Define the tooltips for the days
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TrendChart = ({ habits }) => {
  // State for the 7-day data (Mon-Sun)
  const [weekData, setWeekData] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    // This function processes the habits and calculates the data for the current week
    const processWeekData = () => {
      const days = [0, 0, 0, 0, 0, 0, 0]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, etc.
      
      // Calculate the date for the start of the week (Monday)
      const startOfWeek = new Date(today);
      const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Tue=1... Sun=6
      startOfWeek.setDate(today.getDate() - offset);
      startOfWeek.setHours(0, 0, 0, 0);

      // Create a list of 'YYYY-MM-DD' date strings for this week
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
      }

      // Loop through all habits and their completed dates
      if (habits && habits.length > 0) {
        habits.forEach(habit => {
          if (habit.completedDates) {
            habit.completedDates.forEach(dateStr => {
              // Check if the completed date is in our current week
              const dayIndex = weekDates.indexOf(dateStr);
              if (dayIndex !== -1) {
                // Increment the count for that day
                days[dayIndex]++;
              }
            });
          }
        });
      }

      // Update the chart data
      setWeekData(days);
    };

    processWeekData();
  }, [habits]); // Re-run this logic whenever the habits data changes

  // Find the max value in the week to scale the bars
  const maxCompleted = Math.max(...weekData, 1); // Use 1 as min to avoid division by zero

  return (
    <div className="trend-chart-container glass-card">
      <h3 className="trend-chart-title">Activity Trend</h3>
      
      {/* Simplified bars wrapper */}
      <div className="bars-wrapper">
        {weekData.map((value, index) => (
          <div key={index} className="bar-column">
            <div 
              className="bar" 
              // Calculate bar height relative to the max value
              style={{ height: `${(value / maxCompleted) * 100}%` }}
              title={`${DAY_LABELS[index]}: ${value} habits`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;
