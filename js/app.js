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
    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Better check using IDs (assuming IDs follow pattern 'nav-{pageName}')
    // Special mapping for dashboard which might not have an ID in some versions or usually is just 'nav-dashboard' but let's see.
    // In app.html: dashboard has no ID strictly defined, others are nav-entry, nav-reports, nav-settings.
    // Let's rely on mapping or robust fallback.
    let navId = 'nav-' + pageName;
    if (pageName === 'dashboard') {
        // dashboard item handling - in app.html it's the first one, lacks ID. Let's add ID logic or search by icon/text fallback properly.
        // Actually, we can just grab the first one for dashboard if no ID, OR relying on the fact that I will likely not add ID to dashboard in app.html without editing it.
        // But wait, I'm only editing app.js. The user wanted me to fix bugs.
        // The dashboard link in app.html is: <a class="nav-item active" onclick="loadPage('dashboard')">
        // It has no ID. I'll rely on the text content being "Dashboard" or just matching the onclick attribute which is safer?
        // Let's use a selector that looks for onclick containing the page name.
        const navItem = document.querySelector(`.nav-item[onclick*="'${pageName}'"]`);
    } else {
        // Try ID first
        const navItem = document.getElementById('nav-' + pageName);
    }

    // Actually, simply selecting by onclick is robust enough for this mockup.
    const navItem = document.querySelector(`.nav-item[onclick*="'${pageName}'"]`);
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
        case 'settings':
            renderSettings(contentArea);
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
    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    // Helper to build tree (simplified for MVP: just flat list with indentation)
    const categoryRows = categories.map(cat => {
        const isParent = !cat.parent_id;
        const style = isParent ? 'font-weight: 700; background: #f8fafc;' : 'padding-left: 1rem; white-space: nowrap;';

        let inputsHtml = '';
        if (isParent) {
            inputsHtml = `<td colspan="12"></td>`;
        } else {
            inputsHtml = months.map((m, index) => `
                <td style="padding: 4px;">
                    <input type="number" 
                           class="form-control currency-input" 
                           style="min-width: 80px;"
                           data-cat-id="${cat.id}" 
                           data-month="${index}"
                           placeholder="0" 
                           onchange="saveEntry('${cat.id}', ${index}, this.value)">
                </td>
             `).join('');
        }

        return `
            <tr style="${style}">
                <td style="position: sticky; left: 0; background: inherit; z-index: 1;">${cat.code}</td>
                <td style="position: sticky; left: 60px; background: inherit; z-index: 1; min-width: 200px;">${cat.name}</td>
                ${inputsHtml}
            </tr>
        `;
    }).join('');

    const monthHeaders = months.map(m => `<th style="min-width: 100px;">${m}</th>`).join('');

    container.innerHTML = `
        <div class="header">
            <h1 class="page-title">Bütçe Girişi (Yıllık)</h1>
            <div>
                <span class="badge badge-manager">DRAFT</span>
            </div>
        </div>
        <div class="card" style="padding: 0; overflow: hidden;">
            <div class="table-responsive" style="overflow-x: auto;">
                <table class="data-table" style="min-width: 1500px;">
                    <thead>
                        <tr>
                            <th style="width: 60px; position: sticky; left: 0; z-index: 2;">Kod</th>
                            <th style="min-width: 200px; position: sticky; left: 60px; z-index: 2;">Hesap Kalemi</th>
                            ${monthHeaders}
                        </tr>
                    </thead>
                    <tbody>
                        ${categoryRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Load existing values
    const myLocation = APP_STATE.user.role === 'LOCATION_MANAGER'
        ? db.getLocationByManager(APP_STATE.user.id)
        : db.getLocations()[0];

    if (myLocation) {
        const budgets = db.getBudgets(myLocation.id);
        budgets.forEach(b => {
            if (b.monthly_amounts && Array.isArray(b.monthly_amounts)) {
                b.monthly_amounts.forEach((val, idx) => {
                    const input = document.querySelector(`input[data-cat-id="${b.category_id}"][data-month="${idx}"]`);
                    if (input) input.value = val;
                });
            } else if (b.amount) {
                // Legacy: load into first month? Or ignoring as per plan we might have migrated.
                // If migration in mock_db works, this block might be redundant but safe.
                const input = document.querySelector(`input[data-cat-id="${b.category_id}"][data-month="0"]`);
                if (input) input.value = b.amount;
            }
        });
    }
}

window.saveEntry = function (catId, monthIndex, value) {
    const myLocation = APP_STATE.user.role === 'LOCATION_MANAGER'
        ? db.getLocationByManager(APP_STATE.user.id)
        : db.getLocations()[0];

    if (!myLocation) {
        alert("Bir lokasyona atanmamışsınız.");
        return;
    }

    const amount = parseFloat(value);

    // Allow empty string to mean 0 or just don't save NaN but user might be clearing input. 
    // If value is empty string, treat as 0
    let safeAmount = amount;
    if (value === '') safeAmount = 0;

    if (isNaN(safeAmount)) {
        alert("Lütfen geçerli bir sayı giriniz.");
        return;
    }

    db.saveBudgetEntry({
        location_id: myLocation.id,
        category_id: catId,
        month_index: monthIndex,
        amount: safeAmount,
        notes: ''
    });
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

function renderSettings(container) {
    container.innerHTML = `
        <div class="header">
            <h1 class="page-title">Ayarlar</h1>
        </div>
        
        <div class="card">
            <h3>Profil Ayarları</h3>
            <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label">Ad Soyad</label>
                <input type="text" class="form-control" value="${APP_STATE.user.name}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">E-posta</label>
                <input type="email" class="form-control" value="${APP_STATE.user.email}" readonly>
            </div>
             <div class="form-group">
                <label class="form-label">Rol</label>
                <input type="text" class="form-control" value="${APP_STATE.user.role}" readonly>
            </div>
        </div>

        <div class="card">
            <h3>Uygulama Tercihleri</h3>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <div>
                    <div style="font-weight: 500;">Karanlık Mod</div>
                    <div style="font-size: 0.8rem; color: #64748b;">Arayüzü koyu temaya geçir.</div>
                </div>
                <label class="switch">
                    <input type="checkbox" onclick="toggleTheme()">
                    <span class="slider"></span>
                </label>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div style="font-weight: 500;">Bildirimler</div>
                    <div style="font-size: 0.8rem; color: #64748b;">E-posta bildirimlerini al.</div>
                </div>
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    `;
}

// Quick theme toggle
window.toggleTheme = function () {
    const body = document.body;
    // Simple toggle for demo
    if (body.style.backgroundColor === 'rgb(30, 41, 59)') { // dark slate
        body.style.backgroundColor = '#f1f5f9';
        body.style.color = '#1e293b';
        // Reset other overrides would be needed for full dark mode, this is just a stub
    } else {
        body.style.backgroundColor = '#1e293b';
        body.style.color = '#f8fafc';
    }
}
