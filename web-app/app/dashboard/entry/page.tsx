'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect } from 'react';
import { getCategories, getLocationByManager, getBudgets, getLocations, saveBudgetEntry } from '@/app/actions/budget';

// Define minimal interfaces for local state since we don't import strict types from server actions usually
interface Category {
    id: string;
    code: string;
    name: string;
    parentId: string | null;
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function BudgetEntryPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgetMap, setBudgetMap] = useState<Record<string, number[]>>({}); // Key: catId, Value: array of 12 amounts
    const [locationId, setLocationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function loadData() {
            // Load Location
            let myLocation = null;
            if (user?.role === 'LOCATION_MANAGER') {
                myLocation = await getLocationByManager(user.id);
            } else {
                // Admin fallback - pick first location for demo
                const locs = await getLocations();
                if (locs.length > 0) myLocation = locs[0];
            }

            if (myLocation) {
                setLocationId(myLocation.id);
                const savedBudgets = await getBudgets(myLocation.id);

                // Transform array to map for easy lookup
                const map: Record<string, number[]> = {};
                savedBudgets.forEach((b: any) => {
                    // b.monthlyAmounts comes as array of Decimals/numbers
                    // Server action serialization might return them as strings or numbers
                    if (b.monthlyAmounts) {
                        map[b.categoryId] = b.monthlyAmounts.map((v: any) => Number(v));
                    }
                });
                setBudgetMap(map);
            }

            const cats = await getCategories();
            setCategories(cats);
            setLoading(false);
        }

        loadData();
    }, [user]);

    const handleInputChange = async (catId: string, monthIndex: number, val: string) => {
        if (!locationId) return;

        const numVal = parseFloat(val) || 0;

        // Update Local State Optimistically
        const currentAmounts = budgetMap[catId] ? [...budgetMap[catId]] : new Array(12).fill(0);
        currentAmounts[monthIndex] = numVal;

        setBudgetMap(prev => ({
            ...prev,
            [catId]: currentAmounts
        }));

        // Persist to DB
        await saveBudgetEntry({
            locationId: locationId,
            categoryId: catId,
            monthIndex: monthIndex,
            amount: numVal
        });
    };

    const getRowTotal = (catId: string) => {
        const amounts = budgetMap[catId];
        if (!amounts) return 0;
        return amounts.reduce((a, b) => a + (b || 0), 0);
    };

    if (loading) return <div>Loading data...</div>;
    if (!locationId) return <div>You are not assigned to a location.</div>;

    return (
        <>
            <div className="header">
                <h1 className="page-title">Budget Entry (Annual)</h1>
                <div>
                    <span className="badge badge-manager">DRAFT</span>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: '1600px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '60px', position: 'sticky', left: 0, zIndex: 2 }}>Code</th>
                                <th style={{ minWidth: '200px', position: 'sticky', left: '60px', zIndex: 2 }}>Budget Item</th>
                                {MONTHS.map(m => <th key={m} style={{ minWidth: '100px' }}>{m}</th>)}
                                <th style={{ minWidth: '120px', fontWeight: 800 }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => {
                                const isParent = !cat.parentId;
                                const rowStyle: React.CSSProperties = isParent
                                    ? { fontWeight: 700, background: '#f8fafc' }
                                    : {};

                                return (
                                    <tr key={cat.id} style={rowStyle}>
                                        <td style={{ position: 'sticky', left: 0, background: 'inherit', zIndex: 1 }}>{cat.code}</td>
                                        <td style={{ position: 'sticky', left: '60px', background: 'inherit', zIndex: 1, minWidth: '200px', paddingLeft: isParent ? '0.8rem' : '2rem' }}>
                                            {cat.name}
                                        </td>

                                        {isParent ? (
                                            <td colSpan={13}></td>
                                        ) : (
                                            <>
                                                {MONTHS.map((_, idx) => (
                                                    <td key={idx} style={{ padding: '4px' }}>
                                                        <input
                                                            type="number"
                                                            className="form-control currency-input"
                                                            style={{ minWidth: '80px' }}
                                                            placeholder="0"
                                                            value={budgetMap[cat.id]?.[idx] !== undefined && budgetMap[cat.id]?.[idx] !== 0 ? budgetMap[cat.id]?.[idx] : ''}
                                                            onChange={(e) => handleInputChange(cat.id, idx, e.target.value)}
                                                        />
                                                    </td>
                                                ))}
                                                <td style={{ padding: '4px', fontWeight: 'bold', textAlign: 'right', background: '#f8fafc' }}>
                                                    {getRowTotal(cat.id).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
