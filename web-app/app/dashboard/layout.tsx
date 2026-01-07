'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileSpreadsheet,
    BarChart2,
    Settings,
    LogOut
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
                Loading...
            </div>
        );
    }

    const isActive = (path: string) => pathname === path ? 'active' : '';

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">BudgetOne</div>

                <nav>
                    <Link href="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/entry" className={`nav-item ${isActive('/dashboard/entry')}`}>
                        <FileSpreadsheet size={20} />
                        <span>Budget Entry</span>
                    </Link>
                    <Link href="/dashboard/reports" className={`nav-item ${isActive('/dashboard/reports')}`}>
                        <BarChart2 size={20} />
                        <span>Reports</span>
                    </Link>
                    <Link href="/dashboard/settings" className={`nav-item ${isActive('/dashboard/settings')}`}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </nav>

                <div className="user-profile">
                    <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '50%' }}></div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {user.role === 'ADMIN' ? 'Administrator' : 'Location Manager'}
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: 'auto', cursor: 'pointer' }}
                        title="Logout"
                    >
                        <LogOut width={16} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div id="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
}
