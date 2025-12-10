import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCvnVqXXJvsLaPLgXaHnbMZLr5p6sZO6E4",
  authDomain: "champions-predictions-vote.firebaseapp.com",
  databaseURL: "https://champions-predictions-vote-default-rtdb.firebaseio.com",
  projectId: "champions-predictions-vote",
  storageBucket: "champions-predictions-vote.firebasestorage.app",
  messagingSenderId: "784455119372",
  appId: "1:784455119372:web:798fdcdb61d662cd277429"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);


// Inicializar Firestore (NO Realtime Database)
const db = getFirestore(app);


export { db };
