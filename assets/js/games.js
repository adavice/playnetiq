let currentPage = 1;
const GAMES_PER_PAGE = 8;
let gamesDataCache = null;
let filteredGamesCache = [];

// Mapping of genres to their corresponding icons
const genreIcons = {
  Family: "fas fa-home",
  Sports: "fas fa-football-ball",
  Puzzle: "fas fa-puzzle-piece",
  Endless: "fas fa-infinity",
  Action: "fas fa-fist-raised",
  Kids: "fas fa-child",
  "Big kids": "fas fa-user-friends",
  Strategy: "fas fa-chess",
  Educational: "fas fa-graduation-cap",
  Adventure: "fas fa-map",
  Platformer: "fas fa-running",
  "Match 3": "fas fa-gem",
  Board: "fas fa-dice",
  Multiplayer: "fas fa-users",
  Memory: "fas fa-brain",
  Word: "fas fa-font",
  Cards: "fas fa-heart", // Updated icon for "Cards" genre
};

// Main initialization
async function initialize() {
  await fetchGames();
  renderGenres();
  runGenreFilterFromUrl();
}

// Fetch games data
async function fetchGames() {
  try {
    const response = await fetch("/assets/js/json/marketjs.json");
    const data = await response.json();
    gamesDataCache = Object.values(data.data);
  } catch (error) {
    console.error("Error fetching games:", error);
  }
}

function fetchGamesData() {
  if (gamesDataCache) {
    return Promise.resolve({ data: gamesDataCache });
  }
  return fetch("/assets/js/json/marketjs.json")
    .then((response) => response.json())
    .then((data) => {
      gamesDataCache = Object.values(data.data);
      return { data: gamesDataCache };
    });
}

// Render genre list
function renderGenres() {
  const genres = new Set();
  gamesDataCache.forEach((game) => {
    if (game.genres) {
      game.genres.split(",").forEach((genre) => {
        if (genre.trim()) genres.add(genre.trim());
      });
    }
  });

  const genreList = document.querySelector(".sorter");
  if (!genreList) return;

  genreList.innerHTML = `
    <a href="#" class="genre-link" data-genre="all">
      <li class="list-group-item">
        <i class="fas fa-tag me-2"></i>All
      </li>
    </a>` + 
    Array.from(genres)
      .sort((a, b) => a.localeCompare(b))
      .map(
        (genre) => `
        <a href="#" class="genre-link" data-genre="${genre}">
          <li class="list-group-item">
            <i class="${genreIcons[genre] || "fas fa-tag"} me-2"></i>${genre}
          </li>
        </a>`
      )
      .join("");

  // Add event listeners to genre links
  genreList.querySelectorAll(".genre-link").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const genre = this.getAttribute("data-genre");
      updateUrlAndFilter(genre === "all" ? "" : genre);
    });
  });
}

// Update URL and filter games
function updateUrlAndFilter(genre = "") {
  if (genre) {
    window.history.pushState({}, "", `?cat=${encodeURIComponent(genre)}`);
  } else {
    window.history.pushState({}, "", window.location.pathname);
  }
  runGenreFilterFromUrl();
}

// Highlight selected category
function highlightSelectedCategory(category) {
  document.querySelectorAll(".genre-link").forEach((link) => {
    const linkGenre = link.getAttribute("data-genre");
    const isActive = 
      (category === "" && linkGenre === "all") || 
      (linkGenre === category);
    
    link.classList.toggle("active", isActive);
    link.querySelector(".list-group-item")?.classList.toggle("active", isActive);
  });
}

// Filter games based on URL parameter
function runGenreFilterFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("cat");

  // Update the heading dynamically
  const heading = document.querySelector(".gallery-ltpwrlayouts h2");
  if (heading) {
    heading.textContent = category ? `Games in ${category}` : "All Games";
  }

  highlightSelectedCategory(category);
  filterGamesByGenre(category);
}

// Filter games by genre
function filterGamesByGenre(category = "") {
  filteredGamesCache = category
    ? gamesDataCache.filter((game) =>
        game.genres &&
        game.genres.split(",").map(g => g.trim()).includes(category)
      )
    : gamesDataCache;

  renderGamesPage(1);
}

// Render games for a specific page
function renderGamesPage(page = 1) {
  currentPage = page;
  const start = (page - 1) * GAMES_PER_PAGE;
  const end = start + GAMES_PER_PAGE;
  const gamesToShow = filteredGamesCache.slice(start, end);
  renderGames(gamesToShow);
  renderPagination();
}

// Render games list
function renderGames(games) {
  const gamesList = document.getElementById("games-list");
  if (!gamesList) return;

  gamesList.innerHTML = games.length === 0 
    ? "<p>No games found for this category.</p>"
    : `<div class="row game-cards-row">` + 
      games.map(game => `
        <div class="col-md-3 mb-3">
          <div class="card game-card">
            <img src="${game.banner_small}" class="card-img-top" alt="${game.title}">
            <div class="card-body">
              <h5 class="card-title">${game.title || "Game Title"}</h5>
              <p class="card-text">${game.short_description || "Game description goes here."}</p>
              <div class="play-button">
                <button class="btn btn-primary" data-game-url="${game.url}">Play</button>
              </div>
            </div>
          </div>
        </div>`).join("") +
      `</div>`;
}

// Toast notification function
function showErrorToast(message) {
  const toastElement = document.getElementById("errorToast");
  const toastBody = toastElement.querySelector(".toast-body");
  toastBody.textContent = message;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const totalPages = Math.ceil(filteredGamesCache.length / GAMES_PER_PAGE);
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const maxVisiblePages = 15; // Maximum number of visible pages
  const halfVisible = Math.floor(maxVisiblePages / 2);
  let html = `
    <li class="page-item${currentPage === 1 ? " disabled" : ""}">
      <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">&laquo;</a>
    </li>`;

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, currentPage + halfVisible);

  if (startPage > 1) {
    html += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="1">1</a>
      </li>`;
    if (startPage > 2) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <li class="page-item${i === currentPage ? " active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    html += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
      </li>`;
  }

  html += `
    <li class="page-item${currentPage === totalPages ? " disabled" : ""}">
      <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">&raquo;</a>
    </li>`;

  pagination.innerHTML = html;

  // Add event listeners for pagination links
  pagination.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute("data-page"), 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
        renderGamesPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initialize);
window.addEventListener("popstate", runGenreFilterFromUrl);

// Expose necessary functions to global scope
window.filterGamesByGenre = filterGamesByGenre;