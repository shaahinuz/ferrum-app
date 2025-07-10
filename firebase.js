// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDR1_ol17EyNBm2ngpPmtYlrhLIHB5Y2Rg",
  authDomain: "ferrum-app-3097c.firebaseapp.com",
  projectId: "ferrum-app-3097c",
  storageBucket: "ferrum-app-3097c.firebasestorage.app",
  messagingSenderId: "1011315734502",
  appId: "1:1011315734502:web:af4a472d74a074889e0827",
  measurementId: "G-D7HJ31N6MZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
