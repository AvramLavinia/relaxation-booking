// src/firebase/index.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// (later, you might also import getAuth, getFirestore, etc.)
 
import { firebaseConfig } from "./firebaseConfig";
 
// initialize the core app
const app = initializeApp(firebaseConfig);
 
// optional: analytics
export const analytics = getAnalytics(app);
 
// export the app itself if you need it elsewhere
export default app;