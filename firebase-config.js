// Firebase configuration for joseph-gaming
const firebaseConfig = {
  apiKey: "AIzaSyAKwarb_o8IRGa0DcUPFna13zxnDnAm80",
  authDomain: "joseph-gaming.firebaseapp.com",
  projectId: "joseph-gaming",
  storageBucket: "joseph-gaming.firebasestorage.app",
  messagingSenderId: "981627883612",
  appId: "1:981627883612:web:fe0250ab7d83649dd15699",
  measurementId: "G-1DN80C8J2Y"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
