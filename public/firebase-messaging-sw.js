// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBN79udLFZg2b0P1xHdpGqjoJjhDjK09Tg",
    authDomain: "myexpensenagar.firebaseapp.com",
    projectId: "myexpensenagar",
    storageBucket: "myexpensenagar.firebasestorage.app",
    messagingSenderId: "1060731857293",
    appId: "1:1060731857293:web:52e9e084dfb5bdce2535c4",
    measurementId: "G-8ZB0GHX0DD"
});

const messaging = firebase.messaging();
