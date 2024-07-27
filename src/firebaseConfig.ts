
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyB6rYLDIoWKMrHOf8k3hDIwcyYlhJX5NKQ",
  authDomain: "viso-test-e88d2.firebaseapp.com",
  projectId: "viso-test-e88d2",
  storageBucket: "viso-test-e88d2.appspot.com",
  messagingSenderId: "91307366818",
  appId: "1:91307366818:web:77605feab229890f17fafb",
  measurementId: "G-WXZRSFV8S4"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, firestore, auth };
