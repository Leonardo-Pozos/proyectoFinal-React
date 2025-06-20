// firebase.js corregido
import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDnugtBONgqP8Gi3kBWR7cLBlLxSh7lOI8",
  authDomain: "base-de-datos-react-native.firebaseapp.com",
  projectId: "base-de-datos-react-native",
  storageBucket: "base-de-datos-react-native.firebasestorage.app",
  messagingSenderId: "327935329816",
  appId: "1:327935329816:web:2d8a4ae6e439441de5a56d"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app); // Inicializado correctamente

export { auth, db, storage };