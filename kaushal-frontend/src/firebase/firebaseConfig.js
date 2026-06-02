// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDncW8OeFRUZ6oLgfqCJpDbU_ww8TTCAw",
  authDomain: "kaushal-video-chat.firebaseapp.com",
  databaseURL: "https://kaushal-video-chat-default-rtdb.firebaseio.com",
  projectId: "kaushal-video-chat",
  storageBucket: "kaushal-video-chat.firebasestorage.app",
  messagingSenderId: "968116805509",
  appId: "1:968116805509:web:8eb986f4c7f6d62cf86eec",
  measurementId: "G-GPJFCNP13S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const firestore = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);