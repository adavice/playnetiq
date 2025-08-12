/**
 * Shows a toast notification.
 * @param {string} message - The message to display.
 * @param {'error'|'info'|'success'|'warning'} [type='info'] - The type of notification.
 */
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("globalToastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "globalToastContainer";
    toastContainer.className = "position-fixed top-0 end-0 p-3";
    toastContainer.style.zIndex = 1100;
    document.body.appendChild(toastContainer);
  }

  // Remove any existing toast
  toastContainer.innerHTML = "";

  // Determine toast styling based on type
  let bgClass, iconClass, titleText;

  switch (type) {
    case "error":
      bgClass = "bg-danger text-white";
      iconClass = "fas fa-exclamation-circle";
      titleText = "Error";
      break;
    case "success":
      bgClass = "bg-success text-white";
      iconClass = "fas fa-check-circle";
      titleText = "Success";
      break;
    case "warning":
      bgClass = "bg-warning text-dark";
      iconClass = "fas fa-exclamation-triangle";
      titleText = "Warning";
      break;
    case "info":
    default:
      bgClass = "bg-info text-white";
      iconClass = "fas fa-info-circle";
      titleText = "Info";
      break;
  }

  // Create stylish toast element
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center border-0 shadow-lg ${bgClass}`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");
  toastEl.style.minWidth = "320px";
  toastEl.style.fontSize = "14px";

  toastEl.innerHTML = `
    <div class="toast-header ${bgClass} border-0">
      <i class="${iconClass} me-2"></i>
      <strong class="me-auto">${titleText}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body py-3">
      <div class="d-flex align-items-center">
        <div class="flex-grow-1">
          ${message}
        </div>
      </div>
    </div>
  `;

  toastContainer.appendChild(toastEl);

  // Show toast using Bootstrap's Toast API with longer delay
  if (window.bootstrap && window.bootstrap.Toast) {
    const toast = new bootstrap.Toast(toastEl, {
      delay: 4000,
      animation: true,
    });
    toast.show();

    // Add some custom styling animations
    toastEl.style.transform = "translateX(100%)";
    toastEl.style.transition = "transform 0.3s ease-in-out";

    setTimeout(() => {
      toastEl.style.transform = "translateX(0)";
    }, 50);
  }
}

// Global variables
let isLogged = false; // Can be set by backend or other scripts

/**
 * Check if user is logged in using localStorage
 */
function isUserLoggedIn() {
  const authState = JSON.parse(localStorage.getItem("authState"));
  return authState && authState.isLoggedIn && authState.user;
}

/**
 * Get user data from localStorage
 */
function getUserData() {
  const authState = JSON.parse(localStorage.getItem("authState"));
  return authState && authState.user ? authState.user : null;
}

/**
 * Logout user by removing authState from localStorage
 */
function logoutUser() {
  localStorage.removeItem("authState");
}

// Updates the navbar based on the user's login status.
function updateNavbar() {
  const loginBtn = document.querySelector(".login-btn");
  const usernameDisplay = document.querySelector(".username-display");
  const usernameHolder = document.getElementById("usernameHolder");

  if (isUserLoggedIn()) {
    const user = getUserData();
    usernameHolder.textContent = `Welcome, ${user.username}`;
    loginBtn.classList.add("d-none");
    usernameDisplay.classList.remove("d-none");

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        logoutUser();
        showToast("Logged out successfully!", "success");
        window.location.reload(); // Reload page to update UI
      });
    }
  } else {
    loginBtn.classList.remove("d-none");
    usernameDisplay.classList.add("d-none");
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Make showToast globally available
  window.showToast = showToast;

  const authState = JSON.parse(localStorage.getItem("authState"));
  const usernamePlaceholder = document.getElementById("usernamePlaceholder");

  if (authState && authState.username) {
    usernamePlaceholder.textContent = authState.username;
  }

  // Update navbar based on login status
  updateNavbar();

  // Use event delegation to handle clicks on protected elements
  document.body.addEventListener("click", function (e) {
    // Find the closest ancestor that is a protected element
    const protectedElement = e.target.closest(
      ".play-button button, .play-button a, #ctaButton"
    );

    if (protectedElement) {
      if (!isUserLoggedIn()) {
        e.preventDefault();
        showToast("Please log in to play games", "warning");
        setTimeout(() => {
          window.location.href = "./auth.html";
        }, 3000);
      } else {
        // For logged-in users, proceed with the default action or custom logic
        if (protectedElement.id === "ctaButton") {
          e.preventDefault();
          window.location.href = "./games.html";
        } else {
          const gameUrl = protectedElement.getAttribute("data-game-url");
          if (gameUrl) {
            e.preventDefault();
            window.location.href = gameUrl;
          }
          // If it's a regular link with href and no data-game-url, the browser will follow it.
        }
      }
    }
  });
});
