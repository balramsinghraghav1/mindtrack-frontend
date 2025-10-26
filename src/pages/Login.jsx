import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signup(email, password, name);
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
    <div className="black-bg">
      <div className="container" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div className="glass-card" style={{ maxWidth: '420px', width: '100%' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Activity 
              size={64} 
              color="#9333ea" 
              className="pulse-icon"
            />
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '800', 
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #9333ea, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>
              Pulse
            </h1>
            <p style={{ 
              color: '#a1a1aa', 
              marginTop: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: '500',
              letterSpacing: '0.05em'
            }}>
              The Bio Rhythm
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '14px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              color: '#fca5a5',
              fontSize: '0.95rem'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name Field - Only for Signup */}
            {isSignup && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.6rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#d4d4d8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignup}
                  className="neon-input"
                />
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.6rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#d4d4d8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="neon-input"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.6rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#d4d4d8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="neon-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neon-button"
              style={{ width: '100%', fontSize: '1.05rem', padding: '14px' }}
            >
              {loading ? (
                <div className="loading-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setName('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#9333ea',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                textDecoration: 'underline',
                padding: '0.5rem'
              }}
            >
              {isSignup 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
