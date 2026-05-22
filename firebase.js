import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAI04oN1ortTCPHXk9cY2Eg_D89c1snCyk",
  authDomain: "forge-wk1-school-dashboard.firebaseapp.com",
  projectId: "forge-wk1-school-dashboard",
  storageBucket: "forge-wk1-school-dashboard.firebasestorage.app",
  messagingSenderId: "193508059069",
  appId: "1:193508059069:web:c2e57262f7a90f24eb54d4"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)

export { db }