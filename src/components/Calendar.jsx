import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

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

  function isDateCompleted(day) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return allCompletedDates.has(dateStr);
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
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarIcon size={24} color="#9333ea" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: 'white' }}>
            Activity Calendar
          </h2>
        </div>
      </div>

      {/* Month Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '0.75rem',
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid rgba(147, 51, 234, 0.2)'
      }}>
        <button
          onClick={previousMonth}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#9333ea',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <ChevronLeft size={24} />
        </button>

        <span style={{ 
          fontSize: '1.2rem', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #9333ea, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {monthNames[month]} {year}
        </span>

        <button
          onClick={nextMonth}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#9333ea',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Day Names */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#a1a1aa',
              padding: '0.5rem'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem'
      }}>
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const completed = isDateCompleted(day);
          const count = getCompletionCount(day);
          const today = isToday(day);
          
          return (
            <div
              key={day}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                background: completed 
                  ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.3))'
                  : '#1a1a1a',
                border: today 
                  ? '2px solid #9333ea'
                  : completed 
                    ? '1px solid rgba(147, 51, 234, 0.5)'
                    : '1px solid rgba(147, 51, 234, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                boxShadow: completed ? '0 0 15px rgba(147, 51, 234, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (completed) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = completed ? '0 0 15px rgba(147, 51, 234, 0.3)' : 'none';
              }}
            >
              <span style={{
                fontSize: '0.95rem',
                fontWeight: today ? '700' : '500',
                color: completed ? 'white' : '#a1a1aa'
              }}>
                {day}
              </span>
              
              {completed && count > 0 && (
                <span style={{
                  fontSize: '0.7rem',
                  color: '#ec4899',
                  fontWeight: '700',
                  marginTop: '2px'
                }}>
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid rgba(147, 51, 234, 0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.3))',
              border: '1px solid rgba(147, 51, 234, 0.5)'
            }} />
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
              Activity
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: '#1a1a1a',
              border: '2px solid #9333ea'
            }} />
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
              Today
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: '#1a1a1a',
              border: '1px solid rgba(147, 51, 234, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899',
              fontSize: '0.7rem',
              fontWeight: '700'
            }}>
              3
            </div>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
              Habit Count
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
