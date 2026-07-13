// ── activity.js ──────────────────────────────────────────────────────────
// Everything on the Log page: tab switching between categories, and the 5
// log functions that compute an emission estimate client-side, then send it
// to the backend to be persisted.

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

// FIX: renamed parameters to match what's actually sent to the backend -
// activityType (e.g. "transport"), description (e.g. "Car (10 km)"), and
// carbonEmission (the computed number). Previously this sent
// category/label/emissionKg, which don't exist on ActivityRequestDTO -
// Spring just silently left activityType/description/carbonEmission null on
// the server, which then caused a NullPointerException in
// ActivityService.getDashboard() the next time the dashboard loaded.
async function submitActivity(activityType, description, carbonEmission, inputElementId) {

    try {
        await api.logActivity(activityType, description, carbonEmission);
        showToast(`✅ ${description} logged — ${carbonEmission.toFixed(2)} kg CO₂`, 'green');
        document.getElementById(inputElementId).value = '';
        await refreshAllData();
    } catch (err) {
        showToast(err.message, 'orange');
    }
}

function logTransport() {

    const type = document.getElementById('transportType').value;
    const distance = Number(document.getElementById('distance').value);

    if (!distance || distance <= 0) {
        showToast('Enter a valid distance', 'orange');
        return;
    }

    const factors = { Car: 0.21, Bus: 0.11, Bike: 0.05, Train: 0.08, Flight: 0.45 };
    const emission = distance * factors[type];

    submitActivity('transport', `${type} (${distance} km)`, emission, 'distance');
}

function logEnergy() {

    const type = document.getElementById('energyType').value;
    const hours = Number(document.getElementById('energyUsage').value);

    if (!hours || hours <= 0) {
        showToast('Enter valid usage hours', 'orange');
        return;
    }

    const factors = { Electricity: 0.5, 'Air Conditioner': 1.2, Heater: 1.0, 'Gas Stove': 0.7 };
    const emission = hours * factors[type];

    submitActivity('energy', `${type} (${hours} hrs)`, emission, 'energyUsage');
}

function logFood() {

    const type = document.getElementById('foodType').value;
    const quantity = Number(document.getElementById('foodQuantity').value);

    if (!quantity || quantity <= 0) {
        showToast('Enter a valid quantity', 'orange');
        return;
    }

    const factors = { 'Vegetarian Meal': 0.8, 'Chicken Meal': 2.5, 'Beef Meal': 6.0, 'Dairy Products': 1.8 };
    const emission = quantity * factors[type];

    submitActivity('food', `${type} ×${quantity}`, emission, 'foodQuantity');
}

function logShopping() {

    const type = document.getElementById('shoppingType').value;
    const amount = Number(document.getElementById('shoppingAmount').value);

    if (!amount || amount <= 0) {
        showToast('Enter a valid amount', 'orange');
        return;
    }

    const factors = { Clothes: 0.12, Electronics: 0.3, Furniture: 0.2, Accessories: 0.1 };
    const emission = amount * factors[type];

    submitActivity('shopping', `${type} ($${amount})`, emission, 'shoppingAmount');
}

function logDigital() {

    const type = document.getElementById('digitalType').value;
    const hours = Number(document.getElementById('digitalHours').value);

    if (!hours || hours <= 0) {
        showToast('Enter valid hours', 'orange');
        return;
    }

    const factors = { 'Video Streaming': 0.09, Gaming: 0.15, 'Video Calls': 0.08, 'Social Media': 0.05 };
    const emission = hours * factors[type];

    submitActivity('digital', `${type} (${hours} hrs)`, emission, 'digitalHours');
}