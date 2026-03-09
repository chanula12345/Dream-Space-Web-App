// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
} from "firebase/firestore";
import {
  getStorage,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBceuQ_0b-2ZOB02q0bsi4CBnHtfX09fEE",
  authDomain: "hci-furniture.firebaseapp.com",
  projectId: "hci-furniture",
  storageBucket: "hci-furniture.firebasestorage.app",
  messagingSenderId: "456413113982",
  appId: "1:456413113982:web:d63bae79cd7f9baa38322f",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };