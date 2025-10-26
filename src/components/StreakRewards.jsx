import React from 'react';
import './StreakRewards.css'; // New CSS file for this component

const StreakRewards = ({ totalStreak }) => {
  let medalEmoji = '✨'; // Default sparkle
  let rewardText = 'Keep going!';
  let medalClass = 'default-medal';

  if (totalStreak >= 5000) {
    medalEmoji = '🥇'; // Gold Medal
    rewardText = 'Gold Conqueror!';
    medalClass = 'gold-medal';
  } else if (totalStreak >= 1000) {
    medalEmoji = '🥈'; // Silver Medal
    rewardText = 'Silver Achiever!';
    medalClass = 'silver-medal';
  } else if (totalStreak >= 1) { // Any streak above 0
    medalEmoji = '🥉'; // Bronze Medal
    rewardText = 'First Steps!';
    medalClass = 'bronze-medal';
  }

  return (
    <div className="streak-rewards-container glass-card">
      <h3 className="streak-rewards-title">Streak Rewards</h3>
      <div className={`medal-display ${medalClass}`}>
        <span role="img" aria-label="Medal">{medalEmoji}</span>
      </div>
      <p className="reward-text">{rewardText}</p>
      <p className="current-streak-display">Current Streak: {totalStreak} Days</p>
    </div>
  );
};

export default StreakRewards;
