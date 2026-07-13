// ── dashboard.js ─────────────────────────────────────────────────────────
// Everything that reads data FROM the backend and paints it onto the
// Dashboard, Analytics, Tips, and Profile pages.

let pieChart, lineChart;

const LEVEL_TITLES = [
    'Eco Beginner',
    'Green Learner',
    'Carbon Cutter',
    'Eco Warrior',
    'Climate Champion',
    'Planet Protector'
];

function calcLevel(totalActivities) {
    return Math.floor(totalActivities / 10) + 1;
}

async function refreshAllData() {

    if (!getToken()) {
        return;
    }

    try {

        const [dashboard, activities] = await Promise.all([
            api.getDashboard(),
            api.getActivity()
        ]);

        renderDashboard(dashboard);
        renderCategoryBreakdown(dashboard);
        renderCharts(dashboard, activities);
        renderTopActivity(activities);
        renderProfile(dashboard);
        renderAchievements(dashboard);

    } catch (err) {
        console.error('Failed to load dashboard data:', err);
        showToast(err.message, 'orange');
    }
}

// FIX: reads dashboard.totalEmission / dashboard.monthlyGoal / etc. (the
// actual flat field names on DashboardResponseDTO) instead of
// totalEmissionKg / monthlyGoalKg, which never existed on the backend and
// were always undefined - that's why every number on the dashboard stayed
// at 0 even after successfully logging activities.
function renderDashboard(dashboard) {

    const total = dashboard.totalEmission || 0;
    const goal = dashboard.monthlyGoal || 100;

    document.getElementById('totalEmission').textContent = total.toFixed(1) + ' kg';
    document.getElementById('goalDisplay').textContent = goal + ' kg';

    const pct = Math.min((total / goal) * 100, 100);
    const bar = document.getElementById('goalProgress');

    bar.style.width = pct + '%';
    bar.className = 'progress';

    if (pct >= 90) bar.classList.add('danger');
    else if (pct >= 70) bar.classList.add('warning');

    document.getElementById('goalPercent').textContent = pct.toFixed(0) + '% of goal used';

    const trees = total / 22;
    document.getElementById('treeCount').textContent = trees.toFixed(1);
    document.getElementById('dailyAbsorption').textContent = (trees * 0.06).toFixed(2);
    document.getElementById('forestImpact').textContent = (trees * 25).toFixed(0);

    document.getElementById('headerLevel').textContent = '🏆 Lv ' + calcLevel(dashboard.totalActivities || 0);
    document.getElementById('headerPoints').textContent = (dashboard.totalPoints || 0) + ' pts';
}

// FIX: reads the 5 flat emission fields directly off the dashboard object
// (transportEmission, energyEmission, etc.) instead of a nested
// emissionsByCategory.TRANSPORT map, which the backend never produces.
function renderCategoryBreakdown(dashboard) {

    const map = {
        transportEmission: dashboard.transportEmission,
        energyEmission: dashboard.energyEmission,
        foodEmission: dashboard.foodEmission,
        shoppingEmission: dashboard.shoppingEmission,
        digitalEmission: dashboard.digitalEmission
    };

    Object.entries(map).forEach(([elementId, value]) => {
        const el = document.getElementById(elementId);
        if (el) el.textContent = (value || 0).toFixed(1) + ' kg';
    });
}

// FIX: reads a.description / a.carbonEmission (matching ActivityItemDTO)
// instead of a.label / a.emissionKg, which don't exist on what the backend
// actually returns.
function renderTopActivity(activities) {

    const container = document.getElementById('topActivitiesList');

    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-chart-bar"></i>
                <p>Log activity to see your top emitters</p>
            </div>`;
        return;
    }

    const totalsByLabel = {};

    activities.forEach(a => {
        const label = a.description || a.activityType;
        totalsByLabel[label] = (totalsByLabel[label] || 0) + (a.carbonEmission || 0);
    });

    const sorted = Object.entries(totalsByLabel)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    container.innerHTML = sorted.map(([label, val]) => `
        <div class="activity-item">
            <span>${label}</span>
            <span>${val.toFixed(1)} kg</span>
        </div>`
    ).join('');
}

function createCharts() {

    const pieCtx = document.getElementById('pieChart');
    const lineCtx = document.getElementById('lineChart');

    if (!pieCtx || !lineCtx) return;

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
            labels: [],
            datasets: [{
                label: 'CO₂ Emissions (kg)',
                data: [],
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

// FIX: pie chart now reads the 5 flat fields directly; line chart reads
// entry.createdAt / entry.carbonEmission (matching ActivityItemDTO) instead
// of entry.loggedAt / entry.emissionKg.
function renderCharts(dashboard, activities) {

    if (!pieChart || !lineChart) return;

    pieChart.data.datasets[0].data = [
        dashboard.transportEmission || 0,
        dashboard.energyEmission || 0,
        dashboard.foodEmission || 0,
        dashboard.shoppingEmission || 0,
        dashboard.digitalEmission || 0
    ];
    pieChart.update();

    const dayLabels = [];
    const dayTotals = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        dayTotals.push(0);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    (activities || []).forEach(entry => {
        const loggedDate = new Date(entry.createdAt);
        loggedDate.setHours(0, 0, 0, 0);

        const diffDays = Math.round((today - loggedDate) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 6) {
            const index = 6 - diffDays;
            dayTotals[index] += entry.carbonEmission || 0;
        }
    });

    lineChart.data.labels = dayLabels;
    lineChart.data.datasets[0].data = dayTotals;
    lineChart.update();
}

function renderProfile(dashboard) {

    const totalActivities = dashboard.totalActivities || 0;
    const level = calcLevel(totalActivities);
    const xpInLevel = totalActivities % 10;
    const titleIdx = Math.min(level - 1, LEVEL_TITLES.length - 1);

    document.getElementById('profileLevel').textContent = 'Level ' + level;
    document.getElementById('profileTitle').textContent = LEVEL_TITLES[titleIdx];
    document.getElementById('profilePoints').textContent = dashboard.totalPoints || 0;
    document.getElementById('xpProgress').style.width = (xpInLevel * 10) + '%';
    document.getElementById('xpLabel').textContent = xpInLevel + ' / 10 activity to next level';

    document.getElementById('streakCount').textContent = dashboard.currentStreak || 0;
    document.getElementById('activityCount').textContent = totalActivities;

    // NOTE: the backend doesn't track a separate "longest streak" (only
    // "streak" on the User entity) - showing current streak here as a
    // reasonable stand-in until/unless you add a longestStreak column.
    document.getElementById('bestStreak').textContent = (dashboard.currentStreak || 0) + ' days';
    document.getElementById('bestActivities').textContent = totalActivities;
    document.getElementById('bestLevel').textContent = 'Level ' + level;
}

function renderAchievements(dashboard) {

    const totalActivities = dashboard.totalActivities || 0;

    const unlocked = {
        first: totalActivities >= 1,
        week: (dashboard.currentStreak || 0) >= 7,
        ten: totalActivities >= 10,
        fifty: totalActivities >= 50,
        goal: true,
        green: (dashboard.totalEmission || 0) < (dashboard.monthlyGoal || 100)
    };

    Object.entries(unlocked).forEach(([key, isUnlocked]) => {
        const el = document.getElementById('ach-' + key);
        if (el) el.classList.toggle('unlocked', isUnlocked);
    });
}

// FIX: now calls api.updateGoal(), which hits the real
// PATCH /api/users/me/goal endpoint (ProfileController) - this endpoint
// didn't exist on the backend before, so this button always failed.
async function updateGoal() {

    const val = Number(document.getElementById('goalInput').value);

    if (!val || val <= 0) {
        showToast('Please enter a valid goal', 'orange');
        return;
    }

    try {
        await api.updateGoal(val);
        showToast('✅ Monthly goal updated to ' + val + ' kg', 'green');
        document.getElementById('goalInput').value = '';
        await refreshAllData();
    } catch (err) {
        showToast(err.message, 'orange');
    }
}
