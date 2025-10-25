# Pulse - The Bio Rhythm

A beautiful, water-themed habit tracking application that helps you sync with your natural bio rhythms.

## 🌊 Features

- **Bio Rhythm Tracking** - Track daily habits and build consistent streaks
- **Beautiful Water UI** - Glass morphism design with fluid animations
- **Real-time Sync** - Data persists across devices with Firebase
- **AI-Powered Suggestions** - Get personalized habit recommendations
- **Streak System** - Visual feedback for maintaining consistency
- **Progress Stats** - Track completion rates and streaks

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** CSS3 with Glass Morphism
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Firebase (Auth + Firestore)
- **AI:** Google Gemini API
- **Deployment:** Vercel

## 🎨 Design Philosophy

Pulse uses a water-themed aesthetic to represent the natural flow of habits:
- **Fluid Animations** - Smooth transitions mirror natural rhythms
- **Glass Morphism** - Translucent cards create depth and focus
- **Gradient Colors** - Blue-to-teal palette evokes calm and flow
- **Minimalist UI** - Clean interface reduces friction

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mindtrack-frontend.git
cd mindtrack-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Firebase config to .env
# VITE_FIREBASE_API_KEY=your_key_here

# Start development server
npm run dev
```

## 🔧 Configuration

Update `src/firebase/config.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};
```

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
│   └── AIHabitSuggester.jsx
├── context/           # React Context (Auth)
│   └── AuthContext.jsx
├── firebase/          # Firebase configuration
│   └── config.js
├── pages/             # Page components
│   ├── Login.jsx
│   └── Dashboard.jsx
├── styles/            # Global styles
│   └── globals.css
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## 🎯 Key Features Explained

### Authentication
- Email/password authentication via Firebase
- Persistent sessions
- Protected routes

### Habit Management
- **Create:** Add new habits with a simple form
- **Read:** View all your habits in a clean dashboard
- **Update:** Mark habits as complete for the day
- **Delete:** Remove habits you no longer need

### Streak Tracking
- Calculates consecutive days of completion
- Visual flame icon indicator
- Motivates consistency

### AI Suggestions
- Powered by Google Gemini
- Context-aware recommendations
- One-click habit addition

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod
```

## 📱 Responsive Design

Pulse is fully responsive and optimized for:
- 📱 Mobile (320px+)
- 💻 Tablet (768px+)
- 🖥️ Desktop (1024px+)

## 🔐 Security

- Row-level security with Firestore rules
- Authentication required for all operations
- Users can only access their own data
- API keys secured via environment variables

## 🎨 Color Palette

```css
--water-blue: #0066FF
--water-light: #4D9FFF
--wave-teal: #00C9A7
--bubble-cyan: #7DD3FC
--ocean-deep: #001F3F
```

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

## 📧 Contact

Built with 💙 for the [Hackathon Name]

---

**Live Demo:** [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)  
**Backend Repo:** [github.com/YOUR_USERNAME/mindtrack-backend](https://github.com/YOUR_USERNAME/mindtrack-backend)
