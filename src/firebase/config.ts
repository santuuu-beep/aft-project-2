import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAtcxWqzqKxQB4ZAw3IRmxUcbgmFPJ7Ll8",
  authDomain: "hackathon-b25f1.firebaseapp.com",
  projectId: "hackathon-b25f1",
  storageBucket: "hackathon-b25f1.appspot.com",
  messagingSenderId: "141449823673",
  appId: "1:141449823673:web:2f8e1079d43c85e1a6a268",
  measurementId: "G-Z9BXM91XR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;