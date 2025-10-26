import React, { useState, useEffect } from 'react';
import './Motivation.css'; // We will update this CSS file next

// 1. Expanded to 15 quotes
const quotes = [
  "The secret of getting ahead is getting started.",
  "Your only limit is your mind.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done.",
  "Believe you can and you're halfway there.",
  "The future depends on what you do today.",
  "The only way to do great work is to love what you do.",
  "It's not whether you get knocked down, it's whether you get up.",
  "A little progress each day adds up to big results.",
  "Discipline is the bridge between goals and accomplishment.",
  "You are stronger than you think.",
  "Dream it. Wish it. Do it."
];

const Motivation = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // 3. New logic to get a quote based on the day of the year
    // This ensures the quote is stable for the entire day.

    // Helper function to get the current day of the year (1-366)
    const getDayOfYear = (date) => {
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date - start;
      const oneDay = 1000 * 60 * 60 * 24;
      return Math.floor(diff / oneDay);
    };

    const today = new Date();
    const dayNumber = getDayOfYear(today);

    // Use the modulo operator to pick a quote from the array
    // This deterministically selects a quote for the day
    const quoteIndex = dayNumber % quotes.length;
    
    setQuote(quotes[quoteIndex]);
  }, []); // Still only runs once when the component mounts

  return (
    <div className="motivation-container glass-card">
      {/* 2. Added the new heading */}
      <h3 className="motivation-title">Motivation of the Day</h3>
      <blockquote>
        "{quote}"
      </blockquote>
    </div>
  );
};

export default Motivation;
