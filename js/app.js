/**
 * Main Application Logic
 * Handles Routing, UI Rendering, and Auth Guards
 */

const APP_STATE = {
    user: null,
    currentPage: 'dashboard'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Global Event Listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

// --- Auth Handling ---
function checkAuth() {
    const session = db.getCurrentUser();
    if (session) {
        APP_STATE.user = session;
        showApp();
    } else {
        showLogin();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const result = db.login(email, password);
    if (result.success) {
        APP_STATE.user = result.user;
        showApp();
    } else {
        alert(result.message);
    }
}

function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');

    // Update User Profile UI
    document.getElementById('user-name').innerText = APP_STATE.user.name;
    document.getElementById('user-role').innerText = APP_STATE.user.role === 'ADMIN' ? 'Administrator' : 'Location Manager';

    // Role based navigation hiding
    if (APP_STATE.user.role !== 'ADMIN') {
        // e.g., hide admin settings if we had them
        // document.getElementById('nav-settings').classList.add('hidden');
    }

    loadPage('dashboard');
}

// --- Navigation & Routing ---
window.loadPage = function (pageName) {
    APP_STATE.currentPage = pageName;

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // Simple check, in real app use IDs
    const navItem = Array.from(document.querySelectorAll('.nav-item')).find(el => el.textContent.toLowerCase().includes(pageName === 'entry' ? 'bütçe' : pageName));
    if (navItem) navItem.classList.add('active');

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = ''; // Clear current content

    // Routing Logic
    switch (pageName) {
        case 'dashboard':
            renderDashboard(contentArea);
            break;
        case 'entry':
            renderBudgetEntry(contentArea);
            break;
        case 'reports':
            renderReports(contentArea);
            break;
        default:
            renderDashboard(contentArea);
    }

    lucide.createIcons();
}

// --- Page Renderers ---

function renderDashboard(container) {
    const isManager = APP_STATE.user.role === 'LOCATION_MANAGER';

    let statsHTML = '';
    if (isManager) {
        statsHTML = `
            <div class="card">
                <h3>Hoşgeldiniz, ${APP_STATE.user.name}</h3>
                <p>Lütfen sol menüden "Bütçe Girişi" ekranına giderek verilerinizi yükleyiniz.</p>
            </div>
        `;
    } else {
        // Admin View
        const locations = db.getLocations();
        const report = db.getConsolidatedReport();
        const totalBudget = report.reduce((sum, r) => sum + r.total_amount, 0);

        statsHTML = `
            <div class="grid-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="card">
                    <div style="font-size: 0.9rem; color: #64748b;">Toplam Bütçe</div>
                    <div style="font-size: 2rem; font-weight: 700;">₺${totalBudget.toLocaleString()}</div>
                </div>
                <div class="card">
                    <div style="font-size: 0.9rem; color: #64748b;">Lokasyon Sayısı</div>
                    <div style="font-size: 2rem; font-weight: 700;">${locations.length}</div>
                </div>
                <div class="card">
                    <div style="font-size: 0.9rem; color: #64748b;">Son Güncelleme</div>
                    <div style="font-size: 1.2rem; font-weight: 500;">Bugün</div>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="header">
            <h1 class="page-title">Genel Bakış</h1>
            <button class="btn btn-primary" onclick="loadPage('entry')">+ Yeni Giriş</button>
        </div>
        ${statsHTML}
    `;
}

function renderBudgetEntry(container) {
    // Get Categories
    const categories = db.getCategories();
    // Helper to build tree (simplified for MVP: just flat list with indentation)
    const categoryRows = categories.map(cat => {
        const isParent = !cat.parent_id;
        const style = isParent ? 'font-weight: 700; background: #f8fafc;' : 'padding-left: 2rem;';
        return `
            <tr style="${style}">
                <td>${cat.code}</td>
                <td>${cat.name}</td>
                <td>
                    ${isParent ? '' : `<input type="number" class="form-control currency-input" data-cat-id="${cat.id}" placeholder="0.00" onchange="saveEntry('${cat.id}', this.value)">`}
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="header">
            <h1 class="page-title">Bütçe Girişi</h1>
            <div>
                <span class="badge badge-manager">DRAFT</span>
            </div>
        </div>
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Kod</th>
                        <th>Hesap Kalemi</th>
                        <th style="width: 200px;">Tutar (Yerel Para Birimi)</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoryRows}
                </tbody>
            </table>
        </div>
    `;

    // Load existing values
    const myLocation = APP_STATE.user.role === 'LOCATION_MANAGER'
        ? db.getLocationByManager(APP_STATE.user.id)
        : db.getLocations()[0]; // Admin defaults to first location for demo

    if (myLocation) {
        const budgets = db.getBudgets(myLocation.id);
        budgets.forEach(b => {
            const input = document.querySelector(`input[data-cat-id="${b.category_id}"]`);
            if (input) input.value = b.amount;
        });
    }
}

window.saveEntry = function (catId, value) {
    const myLocation = APP_STATE.user.role === 'LOCATION_MANAGER'
        ? db.getLocationByManager(APP_STATE.user.id)
        : db.getLocations()[0];

    if (!myLocation) {
        alert("Bir lokasyona atanmamışsınız.");
        return;
    }

    db.saveBudgetEntry({
        location_id: myLocation.id,
        category_id: catId,
        amount: parseFloat(value),
        notes: ''
    });

    // Visual feedback?
}

function renderReports(container) {
    const report = db.getConsolidatedReport();

    const rows = report.map(r => `
        <tr>
            <td>${r.category_code}</td>
            <td>${r.category_name}</td>
            <td style="text-align: right;">₺${r.total_amount.toLocaleString()}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="header">
            <h1 class="page-title">Konsolide Rapor</h1>
            <button class="btn btn-secondary">Excel İndir</button>
        </div>
        <div class="card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Kod</th>
                        <th>Hesap Kalemi</th>
                        <th style="text-align: right;">Toplam Tutar</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}
