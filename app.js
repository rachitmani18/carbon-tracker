// ── app.js ───────────────────────────────────────────────────────────────
// Page navigation, toast notifications, the header's login/logout button,
// and the init sequence that wires everything else together on load.
// This file should be loaded LAST (after api.js, dashboard.js, activity.js)
// since it calls functions defined in those files during init.

// ── NAVIGATION ───────────────────────────────────────────────────────────
function showPage(pageId) {

    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active-page');
    });

    document.querySelectorAll('.bottom-nav button').forEach(b => {
        b.classList.remove('active-nav');
    });

    document.getElementById(pageId).classList.add('active-page');

    const navBtn = document.getElementById('nav-' + pageId);
    if (navBtn) navBtn.classList.add('active-nav');
}

// ── TOAST ────────────────────────────────────────────────────────────────
function showToast(message, type = '') {

    const toast = document.getElementById('toast');

    toast.textContent = message;
    toast.className = 'toast show ' + type;

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ── AUTH BUTTON (Login / Logout toggle in header) ───────────────────────
function updateAuthButton() {

    const authBtn = document.getElementById('headerAuthBtn');
    if (!authBtn) return;

    const token = getToken();

    // BUG FIX: login.js saves the logged-in user's email under the key
    // "loggedInUser" (localStorage.setItem("loggedInUser", email)), not
    // "ctUserName" - that key was never being set anywhere, so this always
    // read null and the header permanently showed "Login" even when a valid
    // token existed.
    const loggedInEmail = localStorage.getItem('loggedInUser');

    if (token && loggedInEmail) {

        // No separate "name" field is stored by login.js, only the email -
        // so we show the part before the @ as a friendly display name.
        const displayName = loggedInEmail.split('@')[0];

        authBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> ' + displayName;
        authBtn.href = '#';
        authBtn.onclick = function (e) {
            e.preventDefault();

            const confirmLogout = confirm('Are you sure you want to log out?');

            if (confirmLogout) {
                clearSession();
                showToast('Logged out', 'green');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 800);
            }
        };

    } else {

        authBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
        authBtn.href = 'login.html';
        authBtn.onclick = null;
    }
}

// ── INIT ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

    updateAuthButton();

    createCharts(); // defined in dashboard.js

    if (getToken()) {
        await refreshAllData(); // defined in dashboard.js
    } else {
        showToast('Log in to start tracking your carbon footprint', 'orange');
    }
});