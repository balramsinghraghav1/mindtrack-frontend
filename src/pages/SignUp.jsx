import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, UserPlus } from 'lucide-react';
import './SignUp.css'; // We'll create this CSS file next

export default function SignUp() {
  const [name, setName] = useState(''); // State for the user's name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, updateUserProfile } = useAuth(); // Assuming you have an updateUserProfile function
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // 1. Create the user
      const userCredential = await signup(email, password);
      
      // 2. Update their profile with the name
      // Make sure your AuthContext exposes a function like this:
      // const updateUserProfile = (name) => {
      //   return updateProfile(auth.currentUser, { displayName: name });
      // };
      await updateUserProfile(name); 

      // 3. Redirect to the dashboard
      navigate('/dashboard');

    } catch (err) {
      // --- Friendly error handling ---
      let friendlyMessage = 'An unknown error occurred. Please try again.';
      
      switch (err.code) {
        case 'auth/invalid-email':
          friendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = 'This email is already registered. Please log in.';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'Password is too weak. It must be at least 6 characters.';
          break;
        default:
          friendlyMessage = 'Failed to create an account. Please try again.';
      }
      setError(friendlyMessage);
      // --- End of new logic ---
    }
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card signup-card"
      >
        {/* Header */}
        <div className="signup-header">
          <UserPlus size={48} color="var(--accent-green)" />
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Start your new rhythm today.</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            <AlertCircle size={20} />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="signup-form">
          <div className="input-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              className="neon-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Balaram Singh"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="neon-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="neon-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="neon-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Type your password again"
            />
          </div>

          <button type="submit" className="neon-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Log In Link */}
        <div className="login-link">
          <p>Already have an account? <Link to="/">Log In</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
