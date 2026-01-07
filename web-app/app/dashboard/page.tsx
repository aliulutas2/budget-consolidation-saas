'use client';

import { useAuth } from '../context/AuthContext';
import { db } from '../lib/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBudget: 0,
        locationsCount: 0
    });

    useEffect(() => {
        // Calculate basic stats for admin view
        if (user?.role === 'ADMIN') {
            const locations = db.getLocations();
            const report = db.getConsolidatedReport();
            const totalBudget = report.reduce((sum, r) => sum + r.total_amount, 0);
            setStats({
                totalBudget,
                locationsCount: locations.length
            });
        }
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
