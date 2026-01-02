/**
 * Mock Database Service
 * Simulates a backend API using LocalStorage.
 * Implements the schema defined in system_design.md
 */

const DB_KEYS = {
    USERS: 'budgetone_users',
    LOCATIONS: 'budgetone_locations',
    CATEGORIES: 'budgetone_categories',
    BUDGETS: 'budgetone_budgets',
    SESSION: 'budgetone_session'
};

// Initial Seed Data
const SEED_DATA = {
    users: [
        { id: 'u1', email: 'admin@hq.com', password: '123', role: 'ADMIN', name: 'Can (Admin)' },
        { id: 'u2', email: 'manager@london.com', password: '123', role: 'LOCATION_MANAGER', name: 'John (London)' },
        { id: 'u3', email: 'manager@istanbul.com', password: '123', role: 'LOCATION_MANAGER', name: 'Ayşe (Istanbul)' }
    ],
    locations: [
        { id: 'l1', name: 'London HQ', currency: 'GBP', manager_id: 'u2' },
        { id: 'l2', name: 'Istanbul Branch', currency: 'TRY', manager_id: 'u3' }
    ],
    categories: [
        { id: 'c1', code: '100', name: 'Personel Giderleri', type: 'EXPENSE' },
        { id: 'c2', code: '110', name: 'Maaşlar', parent_id: 'c1' },
        { id: 'c3', code: '120', name: 'SGK & Vergi', parent_id: 'c1' },
        { id: 'c4', code: '200', name: 'Operasyonel Giderler', type: 'EXPENSE' },
        { id: 'c5', code: '210', name: 'Kira', parent_id: 'c4' },
        { id: 'c6', code: '220', name: 'Yazılım Lisansları', parent_id: 'c4' }
    ]
};

class MockDB {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            console.log('Seeding Database...');
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_DATA.users));
            localStorage.setItem(DB_KEYS.LOCATIONS, JSON.stringify(SEED_DATA.locations));
            localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(SEED_DATA.categories));
            localStorage.setItem(DB_KEYS.BUDGETS, JSON.stringify([]));
        }
    }

    // --- Helpers ---
    _get(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    _set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // --- Auth ---
    login(email, password) {
        const users = this._get(DB_KEYS.USERS);
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            const session = { ...user, token: 'mock-jwt-' + Date.now() };
            sessionStorage.setItem(DB_KEYS.SESSION, JSON.stringify(session));
            return { success: true, user: session };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem(DB_KEYS.SESSION));
    }

    logout() {
        sessionStorage.removeItem(DB_KEYS.SESSION);
        window.location.href = 'index.html';
    }

    // --- Data Access ---
    getLocations() {
        return this._get(DB_KEYS.LOCATIONS);
    }

    getLocationByManager(userId) {
        const locations = this.getLocations();
        return locations.find(l => l.manager_id === userId);
    }

    getCategories() {
        return this._get(DB_KEYS.CATEGORIES);
    }

    // --- Budgets ---
    getBudgets(locationId = null) {
        const allBudgets = this._get(DB_KEYS.BUDGETS);
        if (locationId) {
            return allBudgets.filter(b => b.location_id === locationId);
        }
        return allBudgets;
    }

    saveBudgetEntry(entry) {
        const budgets = this._get(DB_KEYS.BUDGETS);
        const existingIndex = budgets.findIndex(
            b => b.location_id === entry.location_id && b.category_id === entry.category_id
        );

        if (existingIndex >= 0) {
            budgets[existingIndex] = { ...budgets[existingIndex], ...entry, updated_at: new Date() };
        } else {
            budgets.push({ ...entry, id: this._generateId(), created_at: new Date() });
        }
        
        this._set(DB_KEYS.BUDGETS, budgets);
        return { success: true };
    }
    
    // Admin: Consolidate
    getConsolidatedReport() {
        const budgets = this._get(DB_KEYS.BUDGETS);
        const categories = this.getCategories();
        
        // Simple aggregation by category
        const report = categories.map(cat => {
            const catEntries = budgets.filter(b => b.category_id === cat.id);
            const total = catEntries.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
            return {
                category_name: cat.name,
                category_code: cat.code,
                total_amount: total,
                entries_count: catEntries.length
            };
        });
        
        return report.filter(r => r.total_amount > 0 || r.entries_count > 0); // Only active lines
    }
}

const db = new MockDB();
window.db = db; // Expose to window for easy access
