import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './Calendar.css'; // Import the new CSS file

export default function Calendar({ habits }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all unique completion dates from all habits
  const allCompletedDates = new Set();
  habits.forEach(habit => {
    if (habit.completedDates) {
      habit.completedDates.forEach(date => allCompletedDates.add(date));
    }
  });

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function previousMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function getCompletionCount(day) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return habits.filter(h => h.completedDates && h.completedDates.includes(dateStr)).length;
  }

  function isToday(day) {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  }

  // --- NEW ---
  // Helper function to render completion dots
  function renderCompletionDots(count) {
    const dots = [];
    const dotCount = Math.min(count, 3); // Show max 3 dots
    if (dotCount === 0) return null;

    for (let i = 0; i < dotCount; i++) {
      dots.push(<div key={i} className="completion-dot"></div>);
    }
    return <div className="completion-dots-container">{dots}</div>;
  }
  // --- END NEW ---

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    // Replaced 'glass-card' with 'calendar-container'
    <div className="calendar-container"> 
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon size={24} color="#9333ea" />
          <h2>Activity Calendar</h2>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="calendar-nav">
        <button onClick={previousMonth} type="button" className="nav-button">
          <ChevronLeft size={24} />
        </button>

        <span className="nav-month">
          {monthNames[month]} {year}
        </span>

        <button onClick={nextMonth} type="button" className="nav-button">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Day Names */}
      <div className="day-names-grid">
        {dayNames.map(day => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-day empty" />;
          }

          const count = getCompletionCount(day);
          const completed = count > 0;
          const today = isToday(day);
          
          // Dynamic classes
          const dayClasses = [
            "calendar-day",
            completed ? "completed" : "",
            today ? "today" : ""
          ].join(" ");
          
          return (
            <div key={day} className={dayClasses}>
              <span className="day-number">{day}</span>
              {renderCompletionDots(count)}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-swatch today-swatch" />
          <span className="legend-label">Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch activity-swatch" />
          <span className="legend-label">Activity</span>
        </div>
      </div>
    </div>
  );
}
