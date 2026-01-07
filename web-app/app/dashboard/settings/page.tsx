'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <>
            <div className="header">
                <h1 className="page-title">Settings</h1>
            </div>

            <div className="card">
                <h3>Profile Settings</h3>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" value={user.name} readOnly />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={user.email} readOnly />
                </div>
                <div className="form-group">
                    <label className="form-label">Role</label>
                    <input type="text" className="form-control" value={user.role} readOnly />
                </div>
            </div>

            <div className="card">
                <h3>App Preferences</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>Dark Mode</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Switch interface to dark theme.</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" onChange={() => alert('Theme toggle not implemented in this demo')} />
                        <span className="slider"></span>
                    </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>Notifications</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Receive email notifications.</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </>
    );
}
