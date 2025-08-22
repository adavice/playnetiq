document.addEventListener('DOMContentLoaded', function () {
  // Determine login state (supports different stored shapes)
  let isLogged = false;
  const raw = localStorage.getItem('authState') || localStorage.getItem('user');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (parsed.isLoggedIn === true) isLogged = true;
        else if (parsed.username) isLogged = true;
        else if (parsed.user && (parsed.user.username || parsed.user.id)) isLogged = true;
      }
    } catch (e) {
      // if raw is a simple string username
      if (raw && raw !== 'null') isLogged = true;
    }
  }

  const loginBtn = document.querySelector('.login-btn');

  if (isLogged) {
    // hide login, show cancel subscription
    if (loginBtn) loginBtn.classList.add('d-none');
  } else {
    // show login, hide cancel subscription
    if (loginBtn) loginBtn.classList.remove('d-none');
  }

  // ensure login button navigates to auth page when clicked
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      // if it's an <a> it will navigate; if button, redirect
      if (loginBtn.tagName.toLowerCase() === 'button') {
        window.location.href = './auth.html';
      }
    });
  }
});

