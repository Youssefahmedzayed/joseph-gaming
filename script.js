// ===== Games from Firebase =====
async function getGames() {
  try {
    const snap = await db.collection("games").orderBy("createdAt", "desc").get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("getGames error:", e);
    // fallback without orderBy if index missing
    try {
      const snap = await db.collection("games").get();
      const games = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      games.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return games;
    } catch (e2) {
      console.error(e2);
      return [];
    }
  }
}

async function addGame(game) {
  const data = { ...game, createdAt: Date.now() };
  delete data.id;
  const ref = await db.collection("games").add(data);
  return ref.id;
}

async function deleteGameById(id) {
  await db.collection("games").doc(String(id)).delete();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== Render Games =====
async function renderGames(sizeFilter = "all", genreFilter = "all", searchTerm = "") {
  const grid = document.getElementById("gamesGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid) return;

  grid.innerHTML = "<p style='color:var(--muted);text-align:center;padding:20px'>جاري التحميل...</p>";

  let games = await getGames();

  if (sizeFilter !== "all") {
    games = games.filter(g => g.category === sizeFilter);
  }
  if (genreFilter !== "all") {
    games = games.filter(g => g.genre === genreFilter);
  }
  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    games = games.filter(g =>
      (g.title || "").toLowerCase().includes(term) ||
      (g.description && g.description.toLowerCase().includes(term))
    );
  }

  if (games.length === 0) {
    grid.innerHTML = "";
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

  grid.innerHTML = games.map(game => `
    <a href="game.html?id=${game.id}" class="game-card">
      <div class="game-image" style="${game.cover ? `background-image:url('${game.cover}');background-size:cover;background-position:center;` : ''}">
        ${game.cover ? '' : '🎮'}
      </div>
      <div class="game-body">
        <h3 class="game-title">${escapeHtml(game.title)}</h3>
        <div class="game-meta">
          <span class="badge badge-${game.category}">${categoryLabels[game.category] || ""}</span>
          ${game.genre ? `<span class="badge" style="background:rgba(0,212,255,.12);color:#00d4ff">${genreLabels[game.genre] || game.genre}</span>` : ""}
          <span>${escapeHtml(game.size || "")}</span>
        </div>
      </div>
    </a>
  `).join("");
}

// ===== Homepage Events =====
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("gamesGrid")) {
    let currentSize = "all";
    let currentGenre = "all";

    function updateActiveUI() {
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.filter === currentSize);
      });
      document.querySelectorAll(".cat-card[data-cat]").forEach(c => {
        c.classList.toggle("active-card", c.dataset.cat === currentSize);
      });
      document.querySelectorAll(".cat-card[data-genre]").forEach(c => {
        c.classList.toggle("active-card", c.dataset.genre === currentGenre);
      });
    }

    function applyFilters() {
      updateActiveUI();
      const q = document.getElementById("searchInput")?.value || "";
      renderGames(currentSize, currentGenre, q);
    }

    renderGames();
    updateActiveUI();

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentSize = btn.dataset.filter;
        applyFilters();
      });
    });

    document.querySelectorAll(".cat-card[data-cat]").forEach(card => {
      card.addEventListener("click", () => {
        currentSize = card.dataset.cat;
        applyFilters();
        document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
      });
    });

    document.querySelectorAll(".cat-card[data-genre]").forEach(card => {
      card.addEventListener("click", () => {
        const g = card.dataset.genre;
        currentGenre = (currentGenre === g) ? "all" : g;
        applyFilters();
        document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
      });
    });

    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", applyFilters);
      searchInput.addEventListener("keyup", e => {
        if (e.key === "Enter") applyFilters();
      });
    }
  }

  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav") || document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
  }
});
