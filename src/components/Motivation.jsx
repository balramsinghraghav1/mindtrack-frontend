import React, { useState, useEffect } from 'react';
import './Motivation.css'; // We will create this CSS file next

// Your 7 pre-fixed quotes
const quotes = [
  "The secret of getting ahead is getting started.",
  "Your only limit is your mind.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done."
];

const Motivation = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // This runs once when the component mounts
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []); // Empty dependency array means it only runs on mount

  return (
    <div className="motivation-container glass-card">
      <blockquote>
        "{quote}"
      </blockquote>
    </div>
  );
};

export default Motivation;
