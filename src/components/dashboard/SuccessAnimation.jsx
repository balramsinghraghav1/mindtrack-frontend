import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

export default function SuccessAnimation({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate confetti pieces
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    rotation: Math.random() * 360,
    color: ['#fbbf24', '#84cc16', '#16a34a', '#ffffff'][Math.floor(Math.random() * 4)]
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="success-animation"
    >
      {/* Confetti */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            top: '-10%', 
            left: `${piece.left}%`,
            rotate: 0,
            opacity: 1
          }}
          animate={{ 
            top: '110%',
            rotate: piece.rotation,
            opacity: 0
          }}
          transition={{ 
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn'
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: piece.color,
            borderRadius: '2px'
          }}
        />
      ))}

      {/* Success Message */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        style={{
          textAlign: 'center',
          zIndex: 10
        }}
      >
        {/* Trophy Icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 0.5,
            repeat: 3,
            repeatDelay: 0.3
          }}
          style={{
            display: 'inline-block',
            marginBottom: '1rem'
          }}
        >
          <Trophy size={80} color="#fbbf24" strokeWidth={2} />
        </motion.div>

        {/* Success Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: '3rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #fbbf24, #84cc16)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem'
          }}
        >
          Goal Set! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontSize: '1.25rem',
            color: '#78716c',
            fontWeight: '500'
          }}
        >
          You're one step closer to greatness!
        </motion.p>

        {/* Floating Stars */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
            style={{
              position: 'absolute',
              top: '40%',
              left: `${30 + i * 20}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <Star size={24} color="#fbbf24" fill="#fbbf24" />
          </motion.div>
        ))}

        {/* Sparkles */}
        {[0, 1].map((i) => (
          <motion.div
            key={`sparkle-${i}`}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.7
            }}
            style={{
              position: 'absolute',
              top: '30%',
              right: `${20 + i * 10}%`
            }}
          >
            <Sparkles size={20} color="#84cc16" />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
