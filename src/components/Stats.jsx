import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, CheckCircle } from 'lucide-react';

/**
 * NOTE:
 * We are assuming the `habits` prop is an array of objects like:
 * [
 * { id: '1', name: 'Drink Water', completedDays: ['2023-10-20', '2023-10-21'] },
 * { id: '2', name: 'Read Book', completedDays: ['2023-10-21'] }
 * ]
 * You will need to fetch and pass this data from your Dashboard.
 */

const Stats = ({ habits = [] }) => {
  
  // Calculate total completions
  const totalCompletions = useMemo(() => {
    return habits.reduce((acc, habit) => acc + (habit.completedDays?.length || 0), 0);
  }, [habits]);

  // Get habits completed today
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = useMemo(() => {
    return habits.filter(habit => habit.completedDays?.includes(todayStr)).length;
  }, [habits, todayStr]);

  // Prepare data for the bar chart
  const chartData = useMemo(() => {
    return habits.map(habit => ({
      name: habit.name.length > 10 ? habit.name.substring(0, 10) + '...' : habit.name,
      completions: habit.completedDays?.length || 0,
    }));
  }, [habits]);

  return (
    <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <TrendingUp className="mr-2" />
        Your Progress
      </h2>
      
      {/* Simple Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Habits" 
          value={habits.length} 
          icon={<Target className="text-blue-500" />} 
        />
        <StatCard 
          title="Completed Today" 
          value={completedToday} 
          icon={<CheckCircle className="text-green-500" />}
        />
        <StatCard 
          title="Total Completions" 
          value={totalCompletions} 
          icon={<TrendingUp className="text-purple-500" />}
        />
      </div>

      {/* Bar Chart for trends */}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Completions per Habit</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={0.1} />
            <XAxis dataKey="name" stroke="#333" />
            <YAxis allowDecimals={false} stroke="#333" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="completions" fill="#1e40af" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Helper component for stat cards
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white/50 p-4 rounded-lg shadow-md flex items-center">
    <div className="p-3 bg-white rounded-full mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Stats;
