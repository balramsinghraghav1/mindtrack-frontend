
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQw_2tOukJIpcVBw17Ub1K7PbJWqoeOh0",
  authDomain: "mindtrack-bed82.firebaseapp.com",
  projectId: "mindtrack-bed82",
  storageBucket: "mindtrack-bed82.firebasestorage.app",
  messagingSenderId: "46278441211",
  appId: "1:46278441211:web:7f8927d22e4c8f6955585e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
