import React, { useState, useEffect } from 'react';
import './TrendChart.css'; // We will create this CSS file next

// Define the labels for the X-axis
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const TrendChart = ({ habits }) => {
  // State for the 7-day data (Mon-Sun)
  const [weekData, setWeekData] = useState([0, 0, 0, 0, 0, 0, 0]);
  // State for the max value of the Y-axis (e.g., 5, 10, 15)
  const [yAxisMax, setYAxisMax] = useState(5);

  useEffect(() => {
    // This function processes the habits and calculates the data for the current week
    const processWeekData = () => {
      const days = [0, 0, 0, 0, 0, 0, 0]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, etc.
      
      // Calculate the date for the start of the week (Monday)
      const startOfWeek = new Date(today);
      // This formula finds the most recent Monday
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

      // Calculate the max value for the Y-axis
      const maxCompleted = Math.max(...days, 0);
      // Set Y-axis to the next multiple of 5 (or at least 5)
      setYAxisMax(Math.max(5, Math.ceil(maxCompleted / 5) * 5));
    };

    processWeekData();
  }, [habits]); // Re-run this logic whenever the habits data changes

  return (
    <div className="trend-chart-container glass-card">
      <h3 className="trend-chart-title">This Week's Activity</h3>
      
      <div className="chart-wrapper">
        {/* Y-Axis Labels */}
        <div className="y-axis">
          <span>{yAxisMax}</span>
          <span>{yAxisMax > 0 ? yAxisMax / 2 : ''}</span>
          <span>0</span>
        </div>

        {/* Chart Bars */}
        <div className="bars-wrapper">
          {weekData.map((value, index) => (
            <div key={index} className="bar-column">
              <div 
                className="bar" 
                // Calculate bar height relative to the max Y-axis value
                style={{ height: yAxisMax === 0 ? '0%' : `${(value / yAxisMax) * 100}%` }}
                title={`${DAY_LABELS[index]}: ${value} habits`}
              ></div>
            </div>
          ))}
        </div>

        {/* X-Axis Labels */}
        <div className="x-axis">
          {DAY_LABELS.map((day, index) => (
            <span key={index} className="x-axis-label">{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
