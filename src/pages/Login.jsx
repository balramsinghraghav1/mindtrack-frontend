import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Droplets, Mail, Lock, Waves } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="water-bg">
      <div className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '450px' }}
        >
          <div className="glass-card">
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ display: 'inline-block' }}
              >
                <Droplets size={64} color="#00C9A7" />
              </motion.div>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #00C9A7, #0066FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MindTrack
              </h1>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                marginTop: '0.5rem' 
              }}>
                Flow into better habits
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  background: 'rgba(255, 107, 107, 0.2)',
                  border: '1px solid rgba(255, 107, 107, 0.5)',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  color: '#FFD1D1'
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  <Mail size={16} style={{ 
                    display: 'inline', 
                    marginRight: '8px',
                    verticalAlign: 'middle'
                  }} />
                  Email
                </label>
                <input
                  type="email"
                  className="water-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  <Lock size={16} style={{ 
                    display: 'inline', 
                    marginRight: '8px',
                    verticalAlign: 'middle'
                  }} />
                  Password
                </label>
                <input
                  type="password"
                  className="water-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="water-button"
                disabled={loading}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {loading ? (
                  <div className="loading-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <Waves size={20} style={{ 
                      display: 'inline', 
                      marginRight: '8px',
                      verticalAlign: 'middle'
                    }} />
                    {isSignup ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                onClick={() => setIsSignup(!isSignup)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00C9A7',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                {isSignup 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}