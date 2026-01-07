'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLocations, getConsolidatedReport } from '../actions/budget';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBudget: 0,
        locationsCount: 0
    });

    useEffect(() => {
        async function loadStats() {
            if (user?.role === 'ADMIN') {
                const locations = await getLocations();
                const report = await getConsolidatedReport();
                // Note: report items from action might differ slightly in type structure locally vs server serialized
                // but for total amount it's fine.
                const totalBudget = report.reduce((sum: number, r: any) => sum + r.total_amount, 0);

                setStats({
                    totalBudget,
                    locationsCount: locations.length
                });
            }
        }
        loadStats();
    }, [user]);

    if (!user) return null;

    const isManager = user.role === 'LOCATION_MANAGER';

    return (
        <>
            <div className="header">
                <h1 className="page-title">Dashboard</h1>
                {isManager ? (
                    <Link href="/dashboard/entry" className="btn btn-primary">+ New Entry</Link>
                ) : (
                    <Link href="/dashboard/reports" className="btn btn-primary">View Reports</Link>
                )}
            </div>

            {isManager ? (
                <div className="card">
                    <h3>Welcome, {user.name}</h3>
                    <p>Please go to the "Budget Entry" screen from the left menu to upload your data.</p>
                </div>
            ) : (
                <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card">
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Budget</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalBudget.toLocaleString()}</div>
                    </div>
                    <div className="card">
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Locations Count</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.locationsCount}</div>
                    </div>
                    <div className="card">
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Live Data</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Active</div>
                    </div>
                </div>
            )}
        </>
    );
}
