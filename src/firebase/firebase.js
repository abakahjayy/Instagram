// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsEkPQfpZOjmRn9pSOqz6Wp3r7VNTMUtA",
  authDomain: "instagram-console-5a60d.firebaseapp.com",
  projectId: "instagram-console-5a60d",
  storageBucket: "instagram-console-5a60d.firebasestorage.app",
  messagingSenderId: "1027385033433",
  appId: "1:1027385033433:web:fc1da799a00c446751b4c8",
  measurementId: "G-3WQ77Y0JE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app,analytics, auth, firestore, storage };
