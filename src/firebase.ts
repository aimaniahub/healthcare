// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD94edRNFIeyWGWgMMF72AO-rI1XW6m2hI",
  authDomain: "healthscore-6de9c.firebaseapp.com",
  projectId: "healthscore-6de9c",
  storageBucket: "healthscore-6de9c.firebasestorage.app",
  messagingSenderId: "1006540481493",
  appId: "1:1006540481493:web:c24260f59e42a5b5fb535c",
  measurementId: "G-KKE2L4FX9S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
