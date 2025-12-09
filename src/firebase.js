import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCvnVqXXJvsLaPLgXaHnbMZLr5p6sZO6E4",
  authDomain: "champions-predictions-vote.firebaseapp.com",
  databaseURL: "https://champions-predictions-vote-default-rtdb.firebaseio.com",
  projectId: "champions-predictions-vote",
  storageBucket: "champions-predictions-vote.firebasestorage.app",
  messagingSenderId: "784455119372",
  appId: "1:784455119372:web:798fdcdb61d662cd277429"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
