// 1. تهيئة الفايربيس وقاعدة البيانات
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkwarb_o8IRGa8DCOuPFnaL3zxnDnAm80",
  authDomain: "joseph-gaming.firebaseapp.com",
  projectId: "joseph-gaming",
  storageBucket: "joseph-gaming.firebasestorage.app",
  messagingSenderId: "981627883612",
  appId: "1:981627883612:web:fe0250ab7d83649dd15699",
  measurementId: "G-1DN0EC0J2Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// دالة جلب وعرض الألعاب
window.loadGames = async function() {
  const gamesList = document.getElementById("games-list");
  if (!gamesList) return;
  
  gamesList.innerHTML = "";
  try {
    const querySnapshot = await getDocs(collection(db, "games"));
    querySnapshot.forEach((document) => {
      const game = document.data();
      const gameElement = document.createElement("div");
      gameElement.className = "game-card";
      gameElement.innerHTML = `
        <h3>${game.name}</h3>
        <a href="${game.url}" target="_blank">تشغيل اللعبة</a>
      `;
      gamesList.appendChild(gameElement);
    });
  } catch (e) {
    console.error("خطأ في جلب الألعاب: ", e);
  }
};

// دالة إضافة لعبة جديدة
window.addNewGame = async function(name, url) {
  try {
    await addDoc(collection(db, "games"), {
      name: name,
      url: url,
      createdAt: new Date()
    });
    alert("تم إضافة اللعبة بنجاح وستحفظ للأبد!");
    window.loadGames();
  } catch (e) {
    console.error("خطأ في الإضافة: ", e);
  }
};

document.addEventListener("DOMContentLoaded", window.loadGames);
