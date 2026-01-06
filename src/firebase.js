import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTjnQ_WyNl6wZF1A7v87f30L5HcAfR6wc",
  authDomain: "thusira-chemicals-e-com.firebaseapp.com",
  databaseURL: "https://thusira-chemicals-e-com-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thusira-chemicals-e-com",
  storageBucket: "thusira-chemicals-e-com.firebasestorage.app",
  messagingSenderId: "61118602158",
  appId: "1:61118602158:web:3effac8dc8c1610eb2063f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);