// كود جلب وحفظ الألعاب بطريقة مبسطة وآمنة
const firebaseConfig = {
  apiKey: "AIzaSyAKwarb_o8IRGa8DCoUPFnal3zxnDnAm80",
  authDomain: "joseph-gaming.firebaseapp.com",
  projectId: "joseph-gaming",
  storageBucket: "joseph-gaming.firebasestorage.app",
  messagingSenderId: "981627883612",
  appId: "1:981627883612:web:fe0250ab7d83649dd15699",
  measurementId: "G-1DN80C0J2Y"
};

// تهيئة Firebase لو مش متعرّفة
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// تفعيل زر القائمة للجوال
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const mainNav = document.getElementById("mainNav");
  if (menuBtn && mainNav) {
    menuBtn.addEventListener("click", () => mainNav.classList.toggle("open"));
  }
  
  loadAndDisplayGames();
});

// دالة جلب وعرض الألعاب
async function loadAndDisplayGames() {
  const gamesGrid = document.getElementById("gamesGrid");
  const emptyState = document.getElementById("emptyState");
  if (!gamesGrid) return;

  try {
    const querySnapshot = await db.collection("games").get();
    let allGames = [];
    querySnapshot.forEach((doc) => {
      allGames.push({ id: doc.id, ...doc.data() });
    });

    if (allGames.length === 0) {
      gamesGrid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    if (emptyState) emptyState.style.display = "none";

    gamesGrid.innerHTML = allGames.map(g => `
      <a href="game.html?id=${g.id}" class="game-card">
        <div class="game-image" style="background-image: url('${g.cover || ""}')"></div>
        <div class="game-body">
          <div class="game-title">${g.title || "بدون عنوان"}</div>
        </div>
      </a>
    `).join("");

  } catch (error) {
    console.error("خطأ في جلب الألعاب:", error);
  }
}

// دالة إضافة لعبة جديدة
window.addGameToFirebase = async function(gameData) {
  try {
    await db.collection("games").add(gameData);
    alert("تمت إضافة اللعبة بنجاح!");
    loadAndDisplayGames();
  } catch (error) {
    console.error("خطأ في الإضافة:", error);
  }
};
