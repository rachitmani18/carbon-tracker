// ── api.js ───────────────────────────────────────────────────────────────
// Single place for every call to the Spring Boot backend.

const API_BASE_URL = 'http://localhost:8080';

function getToken() {
    return localStorage.getItem('token');
}

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('ctRememberedEmail');
}

async function apiFetch(path, options = {}) {

    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    } catch (networkErr) {
        throw new Error('Could not reach the server. Is the backend running?');
    }

    if (response.status === 401 || response.status === 403) {
        clearSession();
        if (!window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
        throw new Error('Session expired - please log in again');
    }

    if (response.status === 204) {
        return null;
    }

    let data = null;
    try {
        data = await response.json();
    } catch (parseErr) {
        // no JSON body - fine, not every response has one
    }

    if (!response.ok) {
        throw new Error((data && data.message) || 'Something went wrong');
    }

    return data;
}

const api = {

    // ── ACTIVITIES ──
    // FIX: field names now match ActivityRequestDTO / ActivityItemDTO exactly
    // (activityType, description, carbonEmission) instead of the made-up
    // category/label/emissionKg names the frontend was using before, which
    // the backend silently ignored (Spring just left those DTO fields null).
    getActivity: () => apiFetch('/api/activity/my'),

    getDashboard: () => apiFetch('/api/activity/dashboard'),

    logActivity: (activityType, description, carbonEmission) => apiFetch('/api/activity/add', {
        method: 'POST',
        body: JSON.stringify({ activityType, description, carbonEmission })
    }),

    // ── USER / GOAL ──
    // These now exist on the backend (ProfileController).
    getCurrentUser: () => apiFetch('/api/users/me'),

    updateGoal: (monthlyGoal) => apiFetch('/api/users/me/goal', {
        method: 'PATCH',
        body: JSON.stringify({ monthlyGoal })
    })
};