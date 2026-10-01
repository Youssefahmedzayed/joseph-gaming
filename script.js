// ===== Games from Firebase =====
async function getGames() {
  try {
    const snap = await db.collection("games").orderBy("createdAt", "desc").get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("getGames error:", e);
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

async function updateGame(id, game) {
  const data = { ...game, updatedAt: Date.now() };
  delete data.id;
  await db.collection("games").doc(String(id)).update(data);
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

// ===== Pagination state =====
const GAMES_PER_PAGE = 9;
let currentPage = 1;
let lastFilteredGames = [];

function renderPagination(total, page) {
  let box = document.getElementById("pagination");
  if (!box) {
    const grid = document.getElementById("gamesGrid");
    if (!grid) return;
    box = document.createElement("div");
    box.id = "pagination";
    box.className = "pagination";
    grid.parentNode.insertBefore(box, grid.nextSibling);
  }

  const totalPages = Math.ceil(total / GAMES_PER_PAGE);
  if (totalPages <= 1) {
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }
  box.style.display = "flex";

  let html = "";
  html += `<button class="page-btn" data-page="prev" ${page <= 1 ? "disabled" : ""}>السابق</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === page ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="page-btn" data-page="next" ${page >= totalPages ? "disabled" : ""}>التالي</button>`;
  box.innerHTML = html;

  box.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.page;
      const totalPagesNow = Math.ceil(lastFilteredGames.length / GAMES_PER_PAGE);
      if (v === "prev") currentPage = Math.max(1, currentPage - 1);
      else if (v === "next") currentPage = Math.min(totalPagesNow, currentPage + 1);
      else currentPage = Number(v);
      paintGamesPage();
      document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function paintGamesPage() {
  const grid = document.getElementById("gamesGrid");
  if (!grid) return;

  const categoryLabels = { weak: "خفيفة", medium: "متوسطة", strong: "قوية" };
  const genreLabels = {
    action: "أكشن", horror: "رعب", adventure: "مغامرات", racing: "سباق",
    sports: "رياضة", strategy: "استراتيجية", rpg: "أدوار", shooter: "شوتر",
    openworld: "عالم مفتوح", other: "أخرى"
  };

  const start = (currentPage - 1) * GAMES_PER_PAGE;
  const pageGames = lastFilteredGames.slice(start, start + GAMES_PER_PAGE);

  grid.innerHTML = pageGames.map(game => `
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

  renderPagination(lastFilteredGames.length, currentPage);
}

// ===== Render Games =====
async function renderGames(sizeFilter = "all", genreFilter = "all", searchTerm = "", resetPage = true) {
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

  lastFilteredGames = games;
  if (resetPage) currentPage = 1;

  if (games.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    const box = document.getElementById("pagination");
    if (box) { box.innerHTML = ""; box.style.display = "none"; }
    return;
  }
  if (emptyState) emptyState.style.display = "none";

  paintGamesPage();
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
      renderGames(currentSize, currentGenre, q, true);
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
