// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from 'firebase/messaging';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBN79udLFZg2b0P1xHdpGqjoJjhDjK09Tg",
  authDomain: "myexpensenagar.firebaseapp.com",
  projectId: "myexpensenagar",
  storageBucket: "myexpensenagar.firebasestorage.app",
  messagingSenderId: "1060731857293",
  appId: "1:1060731857293:web:52e9e084dfb5bdce2535c4",
  measurementId: "G-8ZB0GHX0DD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, messaging };