const gamesPerPage = 8;
let currentPage = 1;
let allGames = [];
let filteredGames = [];

async function fetchGames() {
  try {
    const response = await fetch("/assets/js/json/marketjs.json"); // Update with server endpoint
    const data = await response.json();
    allGames = Object.values(data.data);
    renderGenres();
    filterGamesByGenre(); // Default genre filter
  } catch (error) {
    console.error("Error fetching games:", error);
  }
}

function renderGenres() {
  const genres = new Set();
  allGames.forEach((game) => {
    game.genres.split(",").forEach((genre) => {
      if (genre.trim()) genres.add(genre.trim()); // Filter out empty genres
    });
  });

  const genreList = document.querySelector(".sorter");
  genreList.innerHTML = `
    <a href="#" class="genre-link" onclick="filterGamesByGenre(); return false;">
      <li class="list-group-item">
        <i class="fas fa-tag me-2"></i>All
      </li>
    </a>` + 
    Array.from(genres)
      .sort((a, b) => a.localeCompare(b)) // Sort genres alphabetically
      .map(
        (genre) => `
        <a href="#" class="genre-link" onclick="filterGamesByGenre('${genre}'); return false;">
          <li class="list-group-item">
            <i class="fas fa-tag me-2"></i>${genre}
          </li>
        </a>`
      )
      .join("");
}

function filterGamesByGenre(genre = "") {
  filteredGames = genre
    ? allGames.filter((game) => game.genres.includes(genre))
    : allGames;
  currentPage = 1;
  renderGames(currentPage);
  renderPagination();
}

function renderGames(page) {
  const start = (page - 1) * gamesPerPage;
  const end = start + gamesPerPage;
  const gamesToShow = filteredGames.slice(start, end);

  const gamesList = document.getElementById("games-list");
  gamesList.innerHTML = gamesToShow
    .map(
      (game) => `
    <div class="col-md-6 col-lg-3 mb-4 mt-0">
      <div class="new-grid-ltpwrl gallery-grid view view-eighth zoom-img card h-100">
        <div class="game-image position-relative">
          <img class="img-responsive zoom-img card-img-top" src="${game.banner_medium}" alt="${game.title}" />
          <div class="play-button" style="position:absolute;top:15px;right:15px;">
            <a href="game_play.html?gameUrl=${encodeURIComponent(game.url)}" class="btn btn-play btn-sm" style="padding:0.6rem 1.1rem;">
              <i class="fas fa-play"></i>
            </a>
          </div>
        </div>
        <div class="mask card-body d-flex flex-column justify-content-end">
          <div class="flex_holder">
            <h4>${game.title}</h4>
            <p>${game.short_description}</p>
            <a href="game_play.html?gameUrl=${encodeURIComponent(game.url)}" class="button btn btn-primary btn-sm mt-2">Play Now</a>
          </div>
        </div>
      </div>
    </div>`
    )
    .join("");
}

function renderPagination() {
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const pagination = document.getElementById("pagination");
  let html = "";

  html += `<li class="page-item${currentPage === 1 ? " disabled" : ""}">
    <a class="page-link" href="#" aria-label="Previous" onclick="gotoPage(${currentPage - 1});return false;">&laquo;</a>
  </li>`;

  if (totalPages <= 15) {
    // Show all pages if total pages are 15 or less
    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item${i === currentPage ? " active" : ""}">
        <a class="page-link" href="#" onclick="gotoPage(${i});return false;">${i}</a>
      </li>`;
    }
  } else {
    // Show limited pages with ellipses
    if (currentPage > 3) {
      html += `<li class="page-item">
        <a class="page-link" href="#" onclick="gotoPage(1);return false;">1</a>
      </li>`;
      if (currentPage > 4) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      html += `<li class="page-item${i === currentPage ? " active" : ""}">
        <a class="page-link" href="#" onclick="gotoPage(${i});return false;">${i}</a>
      </li>`;
    }

    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      html += `<li class="page-item">
        <a class="page-link" href="#" onclick="gotoPage(${totalPages});return false;">${totalPages}</a>
      </li>`;
    }
  }

  html += `<li class="page-item${currentPage === totalPages ? " disabled" : ""}">
    <a class="page-link" href="#" aria-label="Next" onclick="gotoPage(${currentPage + 1});return false;">&raquo;</a>
  </li>`;

  pagination.innerHTML = html;
}

function gotoPage(page) {
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderGames(currentPage);
  renderPagination();
}

// Initial fetch and render
fetchGames();

// Expose functions to global scope for inline onclick
window.gotoPage = gotoPage;
window.filterGamesByGenre = filterGamesByGenre;
