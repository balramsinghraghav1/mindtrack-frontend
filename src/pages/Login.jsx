import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, AlertCircle } from 'lucide-react';
import './Login.css'; // This file needs to be created
import { motion } from 'framer-motion'; // <-- ADDED THIS MISSING IMPORT

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      // --- This is the new error handling logic ---
      let friendlyMessage = 'An unknown error occurred. Please try again.';
      
      switch (err.code) {
        case 'auth/invalid-email':
          friendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          friendlyMessage = 'No account found with this email or password.';
          break;
        case 'auth/wrong-password':
          friendlyMessage = 'Wrong password. Please try again.';
          break;
        case 'auth/too-many-requests':
          friendlyMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          friendlyMessage = 'Failed to log in. Please check your details.';
      }
      setError(friendlyMessage);
      // --- End of new logic ---
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card login-card"
      >
        {/* Header */}
        <div className="login-header">
          <Activity size={48} color="var(--accent-green)" />
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Log in to track your pulse.</p>
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
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
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="neon-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="signup-link">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
