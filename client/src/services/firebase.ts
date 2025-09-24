import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBl_VtmQQeuuI2U0z8o2BQgT50mcvwrcvU",
  authDomain: "hrmsauth-c03ac.firebaseapp.com",
  projectId: "hrmsauth-c03ac",
  storageBucket: "hrmsauth-c03ac.firebasestorage.app",
  messagingSenderId: "343195302713",
  appId: "1:343195302713:web:1883fcd4ddc821c12d46e8",
  measurementId: "G-S4SRKE6PEY"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);