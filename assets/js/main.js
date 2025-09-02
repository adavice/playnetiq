document.addEventListener('DOMContentLoaded', function () {
  // Determine login state (supports different stored shapes)
  let isLogged = false;

  const loginBtn = document.querySelector('.login-btn');
  const logoutBtn = document.querySelector('.logout-btn');

  if (isLogged) {
    // hide login, show cancel subscription
    if (loginBtn) loginBtn.classList.add('d-none');
    if (logoutBtn) logoutBtn.classList.remove('d-none');
  } else {
    // show login, hide cancel subscription
    if (loginBtn) loginBtn.classList.remove('d-none');
    if (logoutBtn) logoutBtn.classList.add('d-none');
  }
});

