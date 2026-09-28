import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKwarb_o8IRGa8DCoUPFnal3zxnDnAm80",
  authDomain: "joseph-gaming.firebaseapp.com",
  projectId: "joseph-gaming",
  storageBucket: "joseph-gaming.firebasestorage.app",
  messagingSenderId: "981627883612",
  appId: "1:981627883612:web:fe0250ab7d83649dd15699",
  measurementId: "G-1DN80C0J2Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const gamesCollection = collection(db, "games");

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.getGames = async function() {
  try {
    const querySnapshot = await getDocs(gamesCollection);
    const games = [];
    querySnapshot.forEach((document) => {
      games.push({ id: document.id, ...document.data() });
    });
    return games;
  } catch (error) {
    console.error("خطأ في جلب الألعاب:", error);
    return [];
  }
};

window.saveGames = async function(gamesArray) {
  // للتوافق مع لوحة التحكم القديمة
};

window.addGameToFirebase = async function(gameData) {
  try {
    await addDoc(gamesCollection, gameData);
  } catch (error) {
    console.error("خطأ في إضافة اللعبة:", error);
  }
};

window.deleteGameFromFirebase = async function(id) {
  try {
    await deleteDoc(doc(db, "games", id));
  } catch (error) {
    console.error("خطأ في الحذف:", error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const menuBtn = document.getElementById("menuBtn");
  const mainNav = document.getElementById("mainNav");
  if (menuBtn && mainNav) {
    menuBtn.addEventListener("click", () => mainNav.classList.toggle("open"));
  }

  const gamesGrid = document.getElementById("gamesGrid");
  if (gamesGrid) {
    let allGames = await window.getGames();
    let currentCategory = "all";
    let currentGenre = "all";
    let searchQuery = "";

    function renderGames() {
      const emptyState = document.getElementById("emptyState");
      let filtered = allGames.filter(g => {
        const matchCat = currentCategory === "all" || g.category === currentCategory;
        const matchGenre = currentGenre === "all" || g.genre === currentGenre;
        const matchSearch = !searchQuery || (g.title && g.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCat && matchGenre && matchSearch;
      });

      if (filtered.length === 0) {
        gamesGrid.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
      }
      if (emptyState) emptyState.style.display = "none";

      const categoryLabels = { weak: "خفيفة", medium: "متوسطة", strong: "قوية" };
      const genreLabels = {
        action: "أكشن", horror: "رعب", adventure: "مغامرات", racing: "سباق",
        sports: "رياضة", strategy: "استراتيجية", rpg: "أدوار", shooter: "شوتر",
        openworld: "عالم مفتوح", other: "أخرى"
      };

      gamesGrid.innerHTML = filtered.map(g => {
        const coverHtml = g.cover 
          ? `<div class="game-image" style="background-image: url('${g.cover}')"></div>`
          : `<div class="game-image">🎮</div>`;

        return `
          <a href="game.html?id=${g.id}" class="game-card">
            ${coverHtml}
            <div class="game-body">
              <div class="game-title">${escapeHtml(g.title)}</div>
              <div class="game-meta">
                <span class="badge badge-${g.category}">${categoryLabels[g.category] || ""}</span>
                ${g.genre ? `<span class="badge" style="background:rgba(0,212,255,.12);color:#00d4ff">${genreLabels[g.genre] || g.genre}</span>` : ""}
                ${g.size ? `<span>• ${escapeHtml(g.size)}</span>` : ""}
              </div>
            </div>
          </a>
        `;
      }).join("");
    }

    renderGames();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        renderGames();
      });
    }

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.filter;
        renderGames();
      });
    });

    document.querySelectorAll(".cat-card[data-cat]").forEach(card => {
      card.addEventListener("click", () => {
        currentCategory = card.dataset.cat;
        renderGames();
        document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
      });
    });
  }
});
