import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets } from 'lucide-react';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '2.5rem',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Droplets 
            size={56} 
            color="#00C9A7" 
            style={{ 
              display: 'inline-block',
              animation: 'float 3s ease-in-out infinite'
            }}
          />
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            marginTop: '1rem',
            background: 'linear-gradient(135deg, #00C9A7, #0066FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Pulse
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            marginTop: '0.5rem',
            fontSize: '1rem'
          }}>
            The Bio Rhythm
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(255, 107, 107, 0.25)',
            border: '1px solid rgba(255, 107, 107, 0.5)',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            color: '#FFE5E5',
            fontSize: '0.95rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 101 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.6rem',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.95)'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = '#00C9A7';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 201, 167, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.6rem',
              fontSize: '0.95rem',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.95)'
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
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = '#00C9A7';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 201, 167, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'linear-gradient(135deg, #0066FF, #00C9A7)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading 
                ? 'none' 
                : '0 4px 15px rgba(0, 102, 255, 0.4)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 102, 255, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 102, 255, 0.4)';
              }
            }}
          >
            {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: 'none',
              border: 'none',
              color: '#7DD3FC',
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

      {/* Floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
