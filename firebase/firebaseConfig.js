import { initializeApp } from "firebase/app";
// 👇 1. IMPORT the new functions
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Rohit 
// const firebaseConfig = {
//   apiKey: "AIzaSyCWhDfoedXM7zlz-tgcIpqddt_UmAUbUHk",
//   authDomain: "ocean-hazard-app.firebaseapp.com",
//   projectId: "ocean-hazard-app",
//   storageBucket: "ocean-hazard-app.firebasestorage.app",
//   messagingSenderId: "530645472061",
//   appId: "1:530645472061:web:95951bf9d9045e8999eb54",
//   measurementId: "G-TY2RR42R2D"
// };


// Mine 
const firebaseConfig = {
  apiKey: "AIzaSyBCYa7T6auxJam9LuB7anBHYDIINueqU6s",
  authDomain: "image-c1b84.firebaseapp.com",
  projectId: "image-c1b84",
  storageBucket: "image-c1b84.firebasestorage.app",
  messagingSenderId: "433229564932",
  appId: "1:433229564932:web:50f5eaabe0fb224fc2b951"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👇 2. INITIALIZE Auth with persistence and EXPORT it
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});