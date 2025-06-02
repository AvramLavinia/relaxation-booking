// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
 
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvLIesYc6MDe7IjCJtbTzlj6QAqmVgRBs",
  authDomain: "pingmelater3.firebaseapp.com",
  projectId: "pingmelater3",
  storageBucket: "pingmelater3.firebasestorage.app",
  messagingSenderId: "397953389874",
  appId: "1:397953389874:web:03d53723aa039792af732b",
  measurementId: "G-XHJX1JQW4L"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);