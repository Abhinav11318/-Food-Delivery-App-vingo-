// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{ getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "dishtra-food-delivery.firebaseapp.com",
  projectId: "dishtra-food-delivery",
  storageBucket: "dishtra-food-delivery.firebasestorage.app",
  messagingSenderId: "620737239519",
  appId: "1:620737239519:web:9376595228fc56cbde0c6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export {app,auth}