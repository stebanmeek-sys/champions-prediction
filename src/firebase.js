import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANTE: Reemplaza estos valores con tu configuración real de Firebase
// Puedes encontrarla en: Firebase Console → Configuración del proyecto → General
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

// Exportar para usar en otros archivos
export { db };