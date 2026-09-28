// ===== Storage =====
const defaultGames = [];

function getGames() {
  const stored = localStorage.getItem("josephGames");
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return defaultGames; }
  }
  return defaultGames;
}

function saveGames(games) {
  localStorage.setItem("josephGames", JSON.stringify(games));
}

// ===== Render Games =====
function renderGames(sizeFilter = "all", genreFilter = "all", searchTerm = "") {
  const grid = document.getElementById("gamesGrid");
  const emptyState = document.getElementById("emptyState");
  if (!grid) return;

  let games = getGames();

  // Size filter
  if (sizeFilter !== "all") {
    games = games.filter(g => g.category === sizeFilter);
  }

  // Genre filter
  if (genreFilter !== "all") {
    games = games.filter(g => g.genre === genreFilter);
  }

  // Search
  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    games = games.filter(g =>
      g.title.toLowerCase().includes(term) ||
      (g.description && g.description.toLowerCase().includes(term))
    );
  }

  if (games.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }
  if (emptyState) emptyState.style.display = "none";

  const categoryLabels = {
    weak: "خفيفة",
    medium: "متوسطة",
    strong: "قوية"
  };

  const genreLabels = {
    action: "أكشن",
    horror: "رعب",
    adventure: "مغامرات",
    racing: "سباق",
    sports: "رياضة",
    strategy: "استراتيجية",
    rpg: "أدوار",
    shooter: "شوتر",
    openworld: "عالم مفتوح",
    other: "أخرى"
  };

  grid.innerHTML = games.map(game => `
    <a href="game.html?id=${game.id}" class="game-card">
      <div class="game-image" style="${game.cover ? `background-image:url('${game.cover}');background-size:cover;background-position:center;` : ''}">
        ${game.cover ? '' : (game.emoji || '🎮')}
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

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== Homepage Events =====
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("gamesGrid")) {
    let currentSize = "all";
    let currentGenre = "all";

    function updateActiveUI() {
      // size filter buttons
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.filter === currentSize);
      });
      // size cards
      document.querySelectorAll(".cat-card[data-cat]").forEach(c => {
        c.classList.toggle("active-card", c.dataset.cat === currentSize);
      });
      // genre cards
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

    // Size filter buttons (under latest games)
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentSize = btn.dataset.filter;
        applyFilters();
      });
    });

    // Size category cards (keep genre)
    document.querySelectorAll(".cat-card[data-cat]").forEach(card => {
      card.addEventListener("click", () => {
        currentSize = card.dataset.cat;
        applyFilters();
        document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Genre cards (keep size)
    document.querySelectorAll(".cat-card[data-genre]").forEach(card => {
      card.addEventListener("click", () => {
        // toggle: if same genre clicked again -> reset to all
        const g = card.dataset.genre;
        currentGenre = (currentGenre === g) ? "all" : g;
        applyFilters();
        document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Search
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", applyFilters);
      searchInput.addEventListener("keyup", e => {
        if (e.key === "Enter") applyFilters();
      });
    }
  }

  // Mobile menu
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav") || document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
  }
});
