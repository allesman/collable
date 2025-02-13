// Import the functions you need from the SDKs you need
const fbapp = require("firebase/app");
const fbdb = require("firebase/database");
// import {
//   FIREBASE_API_KEY,
//   FIREBASE_MESSAGING_SENDER_ID,
//   FIREBASE_APP_ID,
// } from "$env/static/private";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "musicalle.firebaseapp.com",
  projectId: "musicalle",
  storageBucket: "musicalle.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = fbapp.initializeApp(firebaseConfig);
const db = fbdb.getDatabase(app);
module.exports = { db };

// TODO: change database rules?
