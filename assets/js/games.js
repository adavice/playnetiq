let currentPage = 1;
const GAMES_PER_PAGE = 8;
let gamesDataCache = null;
let filteredGamesCache = [];

// Mapping of genres to their corresponding icons
const genreIcons = {
  "Family": "fas fa-home",
  "Family Time": "fas fa-home",
  "Sports": "fas fa-football-ball",
  "Game On": "fas fa-football-ball",
  "Puzzle": "fas fa-puzzle-piece",
  "Brain Games": "fas fa-puzzle-piece",
  "Endless": "fas fa-infinity",
  "Endless Mode": "fas fa-infinity",
  "Action": "fas fa-fist-raised",
  "Action Zone": "fas fa-fist-raised",
  "Strategy": "fas fa-chess",
  "Strategy Lab": "fas fa-chess",
  "Adventure": "fas fa-map",
  "Adventure Quest": "fas fa-map",
  "Educational": "fas fa-graduation-cap",
  "Smart Play": "fas fa-graduation-cap",
  "Board": "fas fa-dice",
  "Tabletop Classics": "fas fa-dice",
  "Match 3": "fas fa-gem",
  "Match Madness": "fas fa-gem",
  "Platformer": "fas fa-running",
  "Jump & Run": "fas fa-running",
  "Multiplayer": "fas fa-users",
  "Multiplayer Arena": "fas fa-users",
  "Memory": "fas fa-brain",
  "Memory Challenge": "fas fa-brain",
  "For Children": "fas fa-child",
  "Teenage Games": "fas fa-user-friends",
  "Word": "fas fa-font",
  "Card": "fas fa-heart",
  "Cards": "fas fa-heart",
  "Arcade": "fas fa-gamepad",
  "Racing": "fas fa-flag-checkered",
  "Shooting": "fas fa-bullseye",
  "Casino": "fas fa-coins",
  "Quiz": "fas fa-question",
  "Animals": "fas fa-paw",
  "Bubble Shooter": "fas fa-dot-circle",
  "Dress Up": "fas fa-tshirt",
  "Time Management": "fas fa-clock",
  "Tower Defense": "fas fa-shield-alt",
  "Platform": "fas fa-shoe-prints",
  "Classic": "fas fa-cube",
  "Skill": "fas fa-lightbulb",
  "Mind": "fas fa-brain",
  "Educational Games": "fas fa-book",
  "Adventure Games": "fas fa-hat-wizard",
  "Sports Games": "fas fa-futbol",
  "Action Games": "fas fa-bolt",
  "Puzzle Games": "fas fa-puzzle-piece",
  "Board Games": "fas fa-chess-board",
  "Strategy Games": "fas fa-chess-knight",
  "Multiplayer Games": "fas fa-network-wired",
  "Memory Games": "fas fa-brain",
  "Match Games": "fas fa-th",
  "Platform Games": "fas fa-shoe-prints",
  "Arcade Games": "fas fa-gamepad",
  "Racing Games": "fas fa-flag-checkered",
  "Shooting Games": "fas fa-crosshairs",
  "Casino Games": "fas fa-dice",
  "Quiz Games": "fas fa-question-circle",
  "Animal Games": "fas fa-dog",
  "Bubble Shooter Games": "fas fa-bullseye",
  "Dress Up Games": "fas fa-tshirt",
  "Time Management Games": "fas fa-hourglass-half",
  "Tower Defense Games": "fas fa-fort-awesome",
  // fallback for unknown genres
  "Other": "fas fa-star"
};

// Update genre names for display
const genreDisplayNames = {
  "Family": "Family Time",
  "Puzzle": "Brain Games",
  "Action": "Action Zone",
  "Endless": "Endless Mode",
  "Sports": "Game On",
  "Strategy": "Strategy Lab",
  "Adventure": "Adventure Quest",
  "Educational": "Smart Play",
  "Board": "Tabletop Classics",
  "Match 3": "Match Madness",
  "Platformer": "Jump & Run",
  "Multiplayer": "Multiplayer Arena",
  "Memory": "Memory Challenge",
  "Kids": "For Children",
  "Big Kids": "For Children",
  "Young Kids": "For Children",
  "Abenteuer": "Adventure Quest",
  "abenteuer": "Adventure Quest",
  "Action": "Action Zone",
  "action": "Action Zone",
  "Aktion": "Action Zone",
  "aktion": "Action Zone",
};

// Unified fetchGamesData function
async function fetchGamesData() {
  if (gamesDataCache) {
    return gamesDataCache;
  }
  try {
    const response = await fetch("/assets/js/json/marketjs.json");
    const data = await response.json();
    gamesDataCache = Object.values(data.data);
    return gamesDataCache;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}

// Main initialization
async function initialize() {
  gamesDataCache = await fetchGamesData();
  renderGenres();
  runGenreFilterFromUrl();
}

// Render genre list
function renderGenres() {
  const genres = new Set();
  gamesDataCache.forEach((game) => {
    if (game.genres) {
      game.genres.split(",").forEach((genre) => {
        let trimmed = genre.trim();
        // Normalize weird/foreign or variant genres
        let normalizedGenre = genreDisplayNames[trimmed] || trimmed;
        if (
          ["Kids", "Big Kids", "Big kids", "Young Kids", "Young kids"].includes(trimmed)
        ) {
          normalizedGenre = "For Children";
        }
        // Group "Abenteuer", "abenteuer" to Adventure Quest, "action", "Aktion", "aktion" to Action Zone
        if (["Abenteuer", "abenteuer"].includes(trimmed)) {
          normalizedGenre = "Adventure Quest";
        }
        if (["Action", "action", "Aktion", "aktion"].includes(trimmed)) {
          normalizedGenre = "Action Zone";
        }
        genres.add(normalizedGenre);
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
        game.genres.split(",").some((g) => {
          let trimmed = g.trim();
          let normalizedGenre = genreDisplayNames[trimmed] || trimmed;
          if (
            ["Kids", "Big Kids", "Big kids", "Young Kids", "Young kids"].includes(trimmed)
          ) {
            normalizedGenre = "For Children";
          }
          if (["Abenteuer", "abenteuer"].includes(trimmed)) {
            normalizedGenre = "Adventure Quest";
          }
          if (["Action", "action", "Aktion", "aktion"].includes(trimmed)) {
            normalizedGenre = "Action Zone";
          }
          return normalizedGenre === category;
        })
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
// function renderGames(games) {
//   const gamesList = document.getElementById("games-list");
//   if (!gamesList) return;

//   gamesList.innerHTML = games.length === 0 
//     ? "<p>No games found for this category.</p>"
//     : `<div class="row game-cards-row">` + 
//       games.map(game => `
//         <div class="col-md-3 mb-3">
//           <div class="card game-card">
//             <img src="${game.banner_small}" class="card-img-top" alt="${game.title}">
//             <div class="card-body">
//               <h5 class="card-title">${game.title || "Game Title"}</h5>
//               <p class="card-text">${game.short_description || "Game description goes here."}</p>
//               <p class="card-genre">${genreDisplayNames[game.genres] || game.genres}</p>
//               <div class="play-button">
//                 <a class="btn btn-primary" data-game-url="">Play</a>
//               </div>
//             </div>
//           </div>
//         </div>`).join("") +
//       `</div>`;
// }

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