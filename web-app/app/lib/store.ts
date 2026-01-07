'use client';

/**
 * Mock Database Service
 * Simulates a backend API using LocalStorage.
 * Ported from js/mock_db.js to TypeScript for Next.js
 */

export type UserRole = 'ADMIN' | 'LOCATION_MANAGER';

export interface User {
    id: string;
    email: string;
    password?: string;
    role: UserRole;
    name: string;
    token?: string;
}

export interface Location {
    id: string;
    name: string;
    currency: string; // 'GBP' | 'TRY' etc
    manager_id: string;
}

export type CategoryType = 'INCOME' | 'EXPENSE' | 'ASSET' | 'LIABILITY';

export interface Category {
    id: string;
    code: string;
    name: string;
    type?: CategoryType;
    parent_id?: string;
}

export interface Budget {
    id: string;
    location_id: string;
    category_id: string;
    monthly_amounts: number[]; // Array of 12 numbers
    created_at: string; // ISO date string
    updated_at?: string;
}

export interface ConsolidatedReportItem {
    category_name: string;
    category_code: string;
    total_amount: number;
    entries_count: number;
}

const DB_KEYS = {
    USERS: 'budgetone_users_v3',
    LOCATIONS: 'budgetone_locations_v3',
    CATEGORIES: 'budgetone_categories_v3',
    BUDGETS: 'budgetone_budgets_v3',
    SESSION: 'budgetone_session_v3'
};

const SEED_DATA = {
    users: [
        { id: 'u1', email: 'admin@hq.com', password: '123', role: 'ADMIN', name: 'Can (Admin)' },
        { id: 'u2', email: 'manager@london.com', password: '123', role: 'LOCATION_MANAGER', name: 'John (London)' },
        { id: 'u3', email: 'manager@istanbul.com', password: '123', role: 'LOCATION_MANAGER', name: 'Ayşe (Istanbul)' }
    ] as User[],
    locations: [
        { id: 'l1', name: 'London HQ', currency: 'GBP', manager_id: 'u2' },
        { id: 'l2', name: 'Istanbul Branch', currency: 'TRY', manager_id: 'u3' }
    ] as Location[],
    categories: [
        // 1. Revenue
        { id: 'cat_rev', code: '100', name: 'Revenue', type: 'INCOME' },
        { id: 'c_r1', code: '100.01', name: 'New Business Subscription Revenue', parent_id: 'cat_rev' },
        { id: 'c_r2', code: '100.02', name: 'Renewal Subscription Revenue', parent_id: 'cat_rev' },
        { id: 'c_r3', code: '100.03', name: 'Expansion and Upsell Revenue', parent_id: 'cat_rev' },
        { id: 'c_r4', code: '100.04', name: 'Usage-Based Revenue (Data/API)', parent_id: 'cat_rev' },
        { id: 'c_r5', code: '100.05', name: 'Implementation and Onboarding Fees', parent_id: 'cat_rev' },
        { id: 'c_r6', code: '100.06', name: 'Custom Development and Training', parent_id: 'cat_rev' },

        // 2. COGS
        { id: 'cat_cogs', code: '200', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE' },
        { id: 'c_c1', code: '200.01', name: 'Public Cloud Infrastructure (Production)', parent_id: 'cat_cogs' },
        { id: 'c_c2', code: '200.02', name: 'Content Delivery Network (CDN) Fees', parent_id: 'cat_cogs' },
        { id: 'c_c3', code: '200.03', name: 'Third-Party API and Licensing Fees', parent_id: 'cat_cogs' },
        { id: 'c_c4', code: '200.04', name: 'Technical Customer Support Salaries', parent_id: 'cat_cogs' },
        { id: 'c_c5', code: '200.05', name: 'Customer Success Salaries (Direct)', parent_id: 'cat_cogs' },
        { id: 'c_c6', code: '200.06', name: 'Payment Processing and Merchant Fees', parent_id: 'cat_cogs' },

        // 3. R&D
        { id: 'cat_rnd', code: '300', name: 'Research & Development (R&D)', type: 'EXPENSE' },
        { id: 'c_rd1', code: '300.01', name: 'Software Engineering Salaries', parent_id: 'cat_rnd' },
        { id: 'c_rd2', code: '300.02', name: 'Product Management and Design Salaries', parent_id: 'cat_rnd' },
        { id: 'c_rd3', code: '300.03', name: 'QA Automation and Testing Tool Licenses', parent_id: 'cat_rnd' },
        { id: 'c_rd4', code: '300.04', name: 'International Patent Filing Fees (PCT)', parent_id: 'cat_rnd' },
        { id: 'c_rd5', code: '300.05', name: 'DevOps and CI/CD Pipeline Costs', parent_id: 'cat_rnd' },

        // 4. S&M
        { id: 'cat_sm', code: '400', name: 'Sales & Marketing (S&M)', type: 'EXPENSE' },
        { id: 'c_sm1', code: '400.01', name: 'Sales Base Salaries and OTE Commissions', parent_id: 'cat_sm' },
        { id: 'c_sm2', code: '400.02', name: 'Search Engine and Social Media Ad Spend', parent_id: 'cat_sm' },
        { id: 'c_sm3', code: '400.03', name: 'Trade Show Booth Space and Logistics', parent_id: 'cat_sm' },
        { id: 'c_sm4', code: '400.04', name: 'CRM and Marketing Automation Platform', parent_id: 'cat_sm' },

        // 5. G&A
        { id: 'cat_ga', code: '500', name: 'General & Administrative (G&A)', type: 'EXPENSE' },
        { id: 'c_ga1', code: '500.01', name: 'G&A Salaries (HR, Finance, Admin)', parent_id: 'cat_ga' },
        { id: 'c_ga2', code: '500.02', name: 'Employer Payroll Taxes (Country-Specific)', parent_id: 'cat_ga' },
        { id: 'c_ga3', code: '500.03', name: 'Health, Retirement, and Welfare Benefits', parent_id: 'cat_ga' },
        { id: 'c_ga4', code: '500.04', name: 'International Relocation and Visa Costs', parent_id: 'cat_ga' },
        { id: 'c_ga5', code: '500.05', name: 'Office Rent and Multi-Market Utilities', parent_id: 'cat_ga' },
        { id: 'c_ga6', code: '500.06', name: 'Global Audit and Tax Compliance Fees', parent_id: 'cat_ga' },
        { id: 'c_ga7', code: '500.07', name: 'Business Liability and Cyber Insurance', parent_id: 'cat_ga' },

        // 6. IT/Sec
        { id: 'cat_it', code: '600', name: 'IT & Security', type: 'EXPENSE' },
        { id: 'c_it1', code: '600.01', name: 'Identity Management and SOC Services', parent_id: 'cat_it' },
        { id: 'c_it2', code: '600.02', name: 'Global Laptop and Network Procurement', parent_id: 'cat_it' },

        // 7. CapEx
        { id: 'cat_capex', code: '700', name: 'Capital Expenditures (CapEx)', type: 'ASSET' },
        { id: 'c_cp1', code: '700.01', name: 'Capitalized Internal-Use Development', parent_id: 'cat_capex' }
    ] as Category[]
};

class MockDBService {
    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private init() {
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            console.log('Seeding Database...');
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_DATA.users));
            localStorage.setItem(DB_KEYS.LOCATIONS, JSON.stringify(SEED_DATA.locations));
            localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(SEED_DATA.categories));
            localStorage.setItem(DB_KEYS.BUDGETS, JSON.stringify([]));
        }
    }

    // --- Helpers ---
    private _get<T>(key: string): T {
        if (typeof window === 'undefined') return [] as unknown as T;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    private _set<T>(key: string, data: T) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }

    private _generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // --- Auth ---
    async login(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = this._get<User[]>(DB_KEYS.USERS);
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const session = { ...user, token: 'mock-jwt-' + Date.now() };
            sessionStorage.setItem(DB_KEYS.SESSION, JSON.stringify(session));
            return { success: true, user: session };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;
        const sessionStr = sessionStorage.getItem(DB_KEYS.SESSION);
        return sessionStr ? JSON.parse(sessionStr) : null;
    }

    logout() {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(DB_KEYS.SESSION);
    }

    // --- Data Access ---
    getLocations(): Location[] {
        return this._get<Location[]>(DB_KEYS.LOCATIONS);
    }

    getLocationByManager(userId: string): Location | undefined {
        const locations = this.getLocations();
        return locations.find(l => l.manager_id === userId);
    }

    getCategories(): Category[] {
        return this._get<Category[]>(DB_KEYS.CATEGORIES);
    }

    // --- Budgets ---
    getBudgets(locationId?: string): Budget[] {
        const allBudgets = this._get<Budget[]>(DB_KEYS.BUDGETS);
        if (locationId) {
            return allBudgets.filter(b => b.location_id === locationId);
        }
        return allBudgets;
    }

    saveBudgetEntry(entry: {
        location_id: string;
        category_id: string;
        month_index: number; // 0-11
        amount: number;
    }): { success: boolean } {
        const budgets = this._get<Budget[]>(DB_KEYS.BUDGETS);
        const existingIndex = budgets.findIndex(
            b => b.location_id === entry.location_id && b.category_id === entry.category_id
        );

        let budgetRecord: Budget;

        if (existingIndex >= 0) {
            budgetRecord = budgets[existingIndex];
        } else {
            // New record
            budgetRecord = {
                id: this._generateId(),
                location_id: entry.location_id,
                category_id: entry.category_id,
                monthly_amounts: new Array(12).fill(0),
                created_at: new Date().toISOString()
            };
            budgets.push(budgetRecord);
        }

        // Initialize if missing (legacy safety)
        if (!budgetRecord.monthly_amounts) {
            budgetRecord.monthly_amounts = new Array(12).fill(0);
        }

        // Update specific month
        if (entry.month_index >= 0 && entry.month_index < 12) {
            budgetRecord.monthly_amounts[entry.month_index] = entry.amount;
        }

        budgetRecord.updated_at = new Date().toISOString();

        this._set(DB_KEYS.BUDGETS, budgets);
        return { success: true };
    }

    getConsolidatedReport(): ConsolidatedReportItem[] {
        const budgets = this._get<Budget[]>(DB_KEYS.BUDGETS);
        const categories = this.getCategories();

        // Simple aggregation by category
        const report = categories.map(cat => {
            const catEntries = budgets.filter(b => b.category_id === cat.id);
            const total = catEntries.reduce((sum, item) => {
                let entryTotal = 0;
                if (Array.isArray(item.monthly_amounts)) {
                    entryTotal = item.monthly_amounts.reduce((mSum, val) => mSum + (Number(val) || 0), 0);
                }
                return sum + entryTotal;
            }, 0);

            return {
                category_name: cat.name,
                category_code: cat.code,
                total_amount: total,
                entries_count: catEntries.length
            };
        });

        return report.filter(r => r.total_amount > 0 || r.entries_count > 0);
    }
}

// Export singleton
export const db = new MockDBService();
