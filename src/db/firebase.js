// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2Is44jGYE3yrn7eBy7X52OnGMAhwlq2A",
  authDomain: "proyecto-final-a322f.firebaseapp.com",
  projectId: "proyecto-final-a322f",
  storageBucket: "proyecto-final-a322f.firebasestorage.app",
  messagingSenderId: "192759626690",
  appId: "1:192759626690:web:699d92d3c53477dd0df45b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Inicializa la autenticación con persistencia en AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };