import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkEn2A0kWaGivLFUnm6iypyeFKhtwxvIg",
  authDomain: "gdgfb-66fc2.firebaseapp.com",
  projectId: "gdgfb-66fc2",
  storageBucket: "gdgfb-66fc2.firebasestorage.app",
  messagingSenderId: "829117533669",
  appId: "1:829117533669:web:17475f0f0fce9ee269b30c",
  measurementId: "G-XGMKDT2G53"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);