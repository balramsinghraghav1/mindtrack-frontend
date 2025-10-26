import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function TrendBar({ habits }) {
  // Calculate weekly completion rate
  function getWeeklyCompletion() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
      const completedDates = habit.completedDates || [];
      const weekDates = completedDates.filter(date => {
        const d = new Date(date);
        return d >= weekAgo && d <= today;
      });
      
      totalPossible += 7;
      totalCompleted += weekDates.length;
    });

    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  }

  // Calculate best performing habit
  function getBestHabit() {
    if (habits.length === 0) return null;
    
    return habits.reduce((best, current) => {
      const currentStreak = current.streak || 0;
      const bestStreak = best.streak || 0;
      return currentStreak > bestStreak ? current : best;
    }, habits[0]);
  }

  const weeklyRate = getWeeklyCompletion();
  const bestHabit = getBestHabit();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card"
      style={{ marginBottom: '1.5rem' }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <TrendingUp size={24} color="#84cc16" />
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
          Your Trends
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {/* Weekly Completion */}
        <div style={{
          background: 'rgba(132, 204, 22, 0.1)',
          padding: '1.25rem',
          borderRadius: '16px',
          border: '1px solid rgba(132, 204, 22, 0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <BarChart3 size={20} color="#84cc16" />
            <span style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#57534e'
            }}>
              Weekly Completion
            </span>
          </div>
          
          <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24, #84cc16)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {weeklyRate}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(132, 204, 22, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #fbbf24, #84cc16)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>

        {/* Best Performing Habit */}
        {bestHabit && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid rgba(251, 191, 36, 0.2)'
          }}>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#57534e',
              marginBottom: '0.75rem'
            }}>
              🏆 Top Performer
            </div>
            
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: '700',
              color: '#1c1917',
              marginBottom: '0.5rem',
              lineHeight: '1.3'
            }}>
              {bestHabit.name}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🔥</span>
              <span style={{ 
                fontSize: '1.25rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {bestHabit.streak} days
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
