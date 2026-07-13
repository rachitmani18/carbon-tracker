// ── STATE ──────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8080";

function getToken() {
    return localStorage.getItem("token");
}

async function apiRequest(endpoint, method = "GET", body = null) {

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(BASE_URL + endpoint, options);

    if (response.status === 401) {

        alert("Session Expired");

        localStorage.removeItem("token");

        window.location.href = "login.html";

        return null;
    }

    return await response.json();
}
let totalEmission     = 0;
let transportEmission = 0;
let energyEmission    = 0;
let foodEmission      = 0;
let shoppingEmission  = 0;
let digitalEmission   = 0;

let monthlyGoal     = 100;
let totalActivity = 0;
let totalPoints     = 0;
let currentStreak   = 0;
let longestStreak   = 0;
let goalSet         = false;

// Track daily emissions for the line chart (last 7 days)
let dailyEmissions = [0, 0, 0, 0, 0, 0, 0];
let todayIndex     = new Date().getDay();

// Activity log for top-activities list
let activityLog = [];

// Achievements unlocked
let achievements = {
    first: false,
    week:  false,
    ten:   false,
    fifty: false,
    goal:  false,
    green: false
};

// Level titles
const LEVEL_TITLES = [
    'Eco Beginner',
    'Green Learner',
    'Carbon Cutter',
    'Eco Warrior',
    'Climate Champion',
    'Planet Protector'
];

// ── NAVIGATION ─────────────────────────────────────────────────────────────
function showPage(pageId) {

    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active-page');
    });

    document.querySelectorAll('.bottom-nav button').forEach(b => {
        b.classList.remove('active-nav');
    });

    document.getElementById(pageId).classList.add('active-page');

    const navBtn = document.getElementById('nav-' + pageId);

    if (navBtn) {
        navBtn.classList.add('active-nav');
    }
}

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

// ── SAVE DATA ──────────────────────────────────────────────────────────────
function saveData() {

    localStorage.setItem('totalEmission', totalEmission);

    localStorage.setItem('transportEmission', transportEmission);

    localStorage.setItem('energyEmission', energyEmission);

    localStorage.setItem('foodEmission', foodEmission);

    localStorage.setItem('shoppingEmission', shoppingEmission);

    localStorage.setItem('digitalEmission', digitalEmission);

    localStorage.setItem('monthlyGoal', monthlyGoal);

    localStorage.setItem('totalActivity', totalActivity);

    localStorage.setItem('totalPoints', totalPoints);

    localStorage.setItem('currentStreak', currentStreak);

    localStorage.setItem('longestStreak', longestStreak);

    localStorage.setItem('dailyEmissions', JSON.stringify(dailyEmissions));

    localStorage.setItem('activityLog', JSON.stringify(activityLog));

    localStorage.setItem('achievements', JSON.stringify(achievements));
}

// ── LOAD DATA ──────────────────────────────────────────────────────────────
function loadData() {

    totalEmission = Number(localStorage.getItem('totalEmission')) || 0;

    transportEmission = Number(localStorage.getItem('transportEmission')) || 0;

    energyEmission = Number(localStorage.getItem('energyEmission')) || 0;

    foodEmission = Number(localStorage.getItem('foodEmission')) || 0;

    shoppingEmission = Number(localStorage.getItem('shoppingEmission')) || 0;

    digitalEmission = Number(localStorage.getItem('digitalEmission')) || 0;

    monthlyGoal = Number(localStorage.getItem('monthlyGoal')) || 100;

    totalActivity = Number(localStorage.getItem('totalActivity')) || 0;

    totalPoints = Number(localStorage.getItem('totalPoints')) || 0;

    currentStreak = Number(localStorage.getItem('currentStreak')) || 0;

    longestStreak = Number(localStorage.getItem('longestStreak')) || 0;

    dailyEmissions = JSON.parse(localStorage.getItem('dailyEmissions')) || [0,0,0,0,0,0,0];

    activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];

    achievements = JSON.parse(localStorage.getItem('achievements')) || achievements;
}

// ── DASHBOARD UPDATE ───────────────────────────────────────────────────────
async function updateDashboard(){

const dashboard = await apiRequest("/api/activity/dashboard");

if (!dashboard) return;

totalEmission = dashboard.totalEmission;
transportEmission = dashboard.transportEmission;
foodEmission = dashboard.foodEmission;
energyEmission = dashboard.energyEmission;
shoppingEmission = dashboard.shoppingEmission;
digitalEmission = dashboard.digitalEmission;
totalActivity = dashboard.totalActivity;

    let pct = Math.min((totalEmission / monthlyGoal) * 100, 100);

    const bar = document.getElementById('goalProgress');

    bar.style.width = pct + '%';

    bar.className = 'progress';

    if (pct >= 90) {
        bar.classList.add('danger');
    }
    else if (pct >= 70) {
        bar.classList.add('warning');
    }

    document.getElementById('goalPercent').textContent = pct.toFixed(0) + '% of goal used';

    const trees = totalEmission / 22;

    document.getElementById('treeCount').textContent = trees.toFixed(1);

    document.getElementById('dailyAbsorption').textContent = (trees * 0.06).toFixed(2);

    document.getElementById('forestImpact').textContent = (trees * 25).toFixed(0);

    const level = calcLevel();

    document.getElementById('headerLevel').textContent = '🏆 Lv ' + level;

    document.getElementById('headerPoints').textContent = totalPoints + ' pts';

    updateProfile();

    updateTopActivity();
}

// ── LEVEL / XP ─────────────────────────────────────────────────────────────
function calcLevel() {
    return Math.floor(totalActivity / 10) + 1;
}

function updateProfile() {

    const level = calcLevel();

    const xpInLevel = totalActivity % 10;

    const titleIdx = Math.min(level - 1, LEVEL_TITLES.length - 1);

    document.getElementById('profileLevel').textContent = 'Level ' + level;

    document.getElementById('profileTitle').textContent = LEVEL_TITLES[titleIdx];

    document.getElementById('profilePoints').textContent = totalPoints;

    document.getElementById('xpProgress').style.width = (xpInLevel * 10) + '%';

    document.getElementById('xpLabel').textContent = xpInLevel + ' / 10 activity to next level';

    document.getElementById('streakCount').textContent = currentStreak;

    document.getElementById('activityCount').textContent = totalActivity;

    document.getElementById('bestStreak').textContent = longestStreak + ' days';

    document.getElementById('bestActivity').textContent = totalActivity;

    document.getElementById('bestLevel').textContent = 'Level ' + level;
}

// ── TOP ACTIVITIES ─────────────────────────────────────────────────────────
function updateTopActivity() {

    const container = document.getElementById('topActivityList');

    if (activityLog.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-chart-bar"></i>
                <p>Log activity to see your top emitters</p>
            </div>`;

        return;
    }

    const map = {};

    activityLog.forEach(a => {

        map[a.label] = (map[a.label] || 0) + a.emission;
    });

    const sorted = Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    container.innerHTML = sorted.map(([label, val]) =>

        `<div class="activity-item">
            <span>${label}</span>
            <span>${val.toFixed(1)} kg</span>
        </div>`

    ).join('');
}

// ── GOAL ───────────────────────────────────────────────────────────────────
function updateGoal() {

    const val = Number(document.getElementById('goalInput').value);

    if (!val || val <= 0) {

        showToast('Please enter a valid goal', 'orange');

        return;
    }

    monthlyGoal = val;

    goalSet = true;

    updateDashboard();

    updateCharts();

    saveData();

    showToast('✅ Monthly goal updated to ' + val + ' kg', 'green');

    document.getElementById('goalInput').value = '';
}

// ── ADD EMISSION ───────────────────────────────────────────────────────────
 async function addEmission(category, amount, label) {

    switch (category) {

        case 'transport':
            transportEmission += amount;
            break;

        case 'energy':
            energyEmission += amount;
            break;

        case 'food':
            foodEmission += amount;
            break;

        case 'shopping':
            shoppingEmission += amount;
            break;

        case 'digital':
            digitalEmission += amount;
            break;
    }

    totalEmission += amount;

    totalActivity++;

    totalPoints += Math.max(5, Math.round(10 - amount));

    dailyEmissions[todayIndex] = (dailyEmissions[todayIndex] || 0) + amount;

    currentStreak++;

    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
    }

    activityLog.push({
        label,
        emission: amount
    });

    updateDashboard();

    updateCharts();

    saveData();
}

// ── LOG FUNCTIONS ──────────────────────────────────────────────────────────
function logTransport() {

    const type = document.getElementById('transportType').value;

    const distance = Number(document.getElementById('distance').value);

    if (!distance || distance <= 0) {

        showToast('Enter a valid distance', 'orange');

        return;
    }

    const factors = {
        Car: 0.21,
        Bus: 0.11,
        Bike: 0.05,
        Train: 0.08,
        Flight: 0.45
    };

    const emission = distance * factors[type];

    addEmission('transport', emission, type + ' (' + distance + ' km)');

    showToast('🚗 ' + type + ' logged — ' + emission.toFixed(2) + ' kg CO₂', 'green');

    document.getElementById('distance').value = '';
}

function logEnergy() {

    const type = document.getElementById('energyType').value;

    const hours = Number(document.getElementById('energyUsage').value);

    if (!hours || hours <= 0) {

        showToast('Enter valid usage hours', 'orange');

        return;
    }

    const factors = {
        Electricity: 0.5,
        'Air Conditioner': 1.2,
        Heater: 1.0,
        'Gas Stove': 0.7
    };

    const emission = hours * factors[type];

    addEmission('energy', emission, type + ' (' + hours + ' hrs)');

    showToast('⚡ ' + type + ' logged — ' + emission.toFixed(2) + ' kg CO₂', 'green');

    document.getElementById('energyUsage').value = '';
}

function logFood() {

    const type = document.getElementById('foodType').value;

    const quantity = Number(document.getElementById('foodQuantity').value);

    if (!quantity || quantity <= 0) {

        showToast('Enter a valid quantity', 'orange');

        return;
    }

    const factors = {
        'Vegetarian Meal': 0.8,
        'Chicken Meal': 2.5,
        'Beef Meal': 6.0,
        'Dairy Products': 1.8
    };

    const emission = quantity * factors[type];

    addEmission('food', emission, type + ' ×' + quantity);

    showToast('🍽️ ' + type + ' logged — ' + emission.toFixed(2) + ' kg CO₂', 'green');

    document.getElementById('foodQuantity').value = '';
}

function logShopping() {

    const type = document.getElementById('shoppingType').value;

    const amount = Number(document.getElementById('shoppingAmount').value);

    if (!amount || amount <= 0) {

        showToast('Enter a valid amount', 'orange');

        return;
    }

    const factors = {
        Clothes: 0.12,
        Electronics: 0.3,
        Furniture: 0.2,
        Accessories: 0.1
    };

    const emission = amount * factors[type];

    addEmission('shopping', emission, type + ' ($' + amount + ')');

    showToast('🛍️ ' + type + ' logged — ' + emission.toFixed(2) + ' kg CO₂', 'green');

    document.getElementById('shoppingAmount').value = '';
}

function logDigital() {

    const type = document.getElementById('digitalType').value;

    const hours = Number(document.getElementById('digitalHours').value);

    if (!hours || hours <= 0) {

        showToast('Enter valid hours', 'orange');

        return;
    }

    const factors = {
        'Video Streaming': 0.09,
        Gaming: 0.15,
        'Video Calls': 0.08,
        'Social Media': 0.05
    };

    const emission = hours * factors[type];

    addEmission('digital', emission, type + ' (' + hours + ' hrs)');

    showToast('📱 ' + type + ' logged — ' + emission.toFixed(2) + ' kg CO₂', 'green');

    document.getElementById('digitalHours').value = '';
}

// ── TAB SWITCHER ───────────────────────────────────────────────────────────
function switchTab(tabName, button) {

    document.querySelectorAll('.log-form').forEach(f => {
        f.classList.remove('active-form');
    });

    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active-tab');
    });

    document.getElementById(tabName + 'Form').classList.add('active-form');

    button.classList.add('active-tab');
}

// ── CHARTS ─────────────────────────────────────────────────────────────────
let pieChart, lineChart;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getOrderedDayLabels() {

    const labels = [];

    for (let i = 6; i >= 0; i--) {
        labels.push(DAY_LABELS[(todayIndex - i + 7) % 7]);
    }

    return labels;
}

function getOrderedDailyData() {

    const data = [];

    for (let i = 6; i >= 0; i--) {
        data.push(dailyEmissions[(todayIndex - i + 7) % 7]);
    }

    return data;
}

function createCharts() {

    const pieCtx  = document.getElementById('pieChart');

    const lineCtx = document.getElementById('lineChart');

    pieChart = new Chart(pieCtx, {

        type: 'doughnut',

        data: {
            labels: ['Transport', 'Energy', 'Food', 'Shopping', 'Digital'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: ['#16a34a', '#2563eb', '#f59e0b', '#db2777', '#9333ea'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        }
    });

    lineChart = new Chart(lineCtx, {

        type: 'line',

        data: {
            labels: getOrderedDayLabels(),
            datasets: [{
                label: 'CO₂ Emissions (kg)',
                data: getOrderedDailyData(),
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22,163,74,0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#16a34a',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        }
    });
}

function updateCharts() {

    if (!pieChart || !lineChart) return;

    pieChart.data.datasets[0].data = [
        transportEmission,
        energyEmission,
        foodEmission,
        shoppingEmission,
        digitalEmission
    ];

    pieChart.update();

    lineChart.data.labels = getOrderedDayLabels();

    lineChart.data.datasets[0].data = getOrderedDailyData();

    lineChart.update();
}

// ── AUTH STATUS DISPLAY ─────────────────────────────────────────────────
function updateAuthButton() {

    const authBtn = document.getElementById('headerAuthBtn');
    const currentUser = localStorage.getItem('ctCurrentUser');

    if (currentUser) {

        const users = JSON.parse(localStorage.getItem('ctUsers')) || [];
        const user = users.find(u => u.email === currentUser);
        const name = user ? user.name.split(' ')[0] : 'Account';

        authBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> ' + name;
        authBtn.href = '#';
        authBtn.onclick = function (e) {
            e.preventDefault();

            const confirmLogout = confirm('Are you sure you want to log out?');

            if (confirmLogout) {
                localStorage.removeItem('ctCurrentUser');
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

// ── INIT ───────────────────────────────────────────────────────────────────
loadData();
createCharts();
updateDashboard();
updateCharts();
updateAuthButton();