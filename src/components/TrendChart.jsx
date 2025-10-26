import React from 'react';
import './TrendChart.css'; // New CSS file for this component

const TrendChart = () => {
  // Placeholder data for a 7-day trend (e.g., number of habits completed)
  // Replace with actual data from Firebase if you implement trend tracking
  const trendData = [3, 5, 4, 6, 7, 5, 8]; // Example values for 7 days

  return (
    <div className="trend-chart-container glass-card">
      <h3 className="trend-chart-title">Activity Trend</h3>
      <div className="bars-wrapper">
        {trendData.map((value, index) => (
          <div key={index} className="bar-column">
            {/* Height is proportional to value, max height 100% for highest value */}
            <div 
              className="bar" 
              style={{ height: `${(value / Math.max(...trendData)) * 100}%` }}
              title={`Day ${index + 1}: ${value} activities`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;
