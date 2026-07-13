// ── TOAST ──────────────────────────────────────────────────────────────────
function showToast(message, type = '') {

    const toast = document.getElementById('toast');

    toast.textContent = message;

    toast.className = 'toast show ' + type;

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}
const API_URL = "http://localhost:8080/api/auth";

// ── TAB SWITCHER (Login / Sign Up) ─────────────────────────────────────────
function switchAuthTab(tabName, button) {

    document.querySelectorAll('.log-form').forEach(f => {
        f.classList.remove('active-form');
    });

    document.querySelectorAll('.auth-tabs .tab-btn').forEach(b => {
        b.classList.remove('active-tab');
    });

    document.getElementById(tabName + 'Form').classList.add('active-form');

    button.classList.add('active-tab');
}

// ── PASSWORD VISIBILITY TOGGLE ─────────────────────────────────────────────
function togglePassword(inputId, iconEl) {

    const input = document.getElementById(inputId);

    if (input.type === 'password') {
        input.type = 'text';
        iconEl.classList.remove('fa-eye');
        iconEl.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        iconEl.classList.remove('fa-eye-slash');
        iconEl.classList.add('fa-eye');
    }
}

// ── USER STORE (localStorage-based, same pattern as main app) ─────────────


// ── SIGN UP ─────────────────────────────────────────────────────────────────
async function handleSignup(event) {

    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;

    if (password !== confirmPassword) {

        showToast("Passwords do not match", "orange");
        return false;
    }

    try {

        const response = await fetch(API_URL + "/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })

        });

        const data = await response.json();

        if (response.ok && data.success) {

            showToast(data.message, "green");

            setTimeout(() => {

                switchAuthTab(
                    "login",
                    document.getElementById("loginTabBtn")
                );

            }, 1000);

        } else {

            showToast(data.message, "orange");

        }

    } catch (error) {

        console.error(error);
        showToast("Cannot connect to backend", "orange");

    }

    return false;
}

// ── LOGIN ───────────────────────────────────────────────────────────────────
async function handleLogin(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {

        const response = await fetch(API_URL + "/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (response.ok && data.success) {

            // Save JWT
            localStorage.setItem("token", data.token);

            // Save logged in email
            localStorage.setItem("loggedInUser", email);

            // Remember email if checked
            if (document.getElementById("rememberMe").checked) {

                localStorage.setItem("ctRememberedEmail", email);

            } else {

                localStorage.removeItem("ctRememberedEmail");

            }

            showToast(data.message, "green");

            setTimeout(() => {

                window.location.href = "index.html";

            }, 1000);

        } else {

            showToast(data.message, "orange");

        }

    } catch (error) {

        console.error(error);
        showToast("Cannot connect to backend", "orange");

    }

    return false;
}

// ── FORGOT PASSWORD ─────────────────────────────────────────────────────────


// ── ILLUSTRATION PANEL PREVIEW STATS ────────────────────────────────────────
// Pulls a quick snapshot from existing app data (if the user has used the
// tracker before) so the illustration panel feels alive rather than static.
function populateIllustrationStats() {

    const totalEmission = Number(localStorage.getItem('totalEmission')) || 0;

    const monthlyGoal = Number(localStorage.getItem('monthlyGoal')) || 100;

    const trees = totalEmission / 22;

    const score = monthlyGoal > 0
        ? Math.max(0, Math.min(100, Math.round(100 - (totalEmission / monthlyGoal) * 100)))
        : 100;

    document.getElementById('illustrationSaved').textContent = totalEmission.toFixed(0) + ' kg';

    document.getElementById('illustrationTrees').textContent = trees.toFixed(1);

    document.getElementById('illustrationScore').textContent = score + '%';
}

// ── INIT ─────────────────────────────────────────────────────────────────────
(function init() {

    populateIllustrationStats();

    const rememberedEmail = localStorage.getItem('ctRememberedEmail');

    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }

})();