'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('admin@hq.com');
    const [password, setPassword] = useState('123');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const result = await login(email, password);
        if (!result.success) {
            setError(result.message || 'Login failed');
            setIsSubmitting(false);
        }
        // If success, router.push happens in context
    };

    return (
        <div className="login-container"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
            <div className="card" style={{ width: '400px', padding: '2.5rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Please login to your account.</p>

                {error && (
                    <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            required
                            placeholder="admin@hq.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            required
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                        <small><strong>Demo Users:</strong></small><br />
                        <small>Admin: admin@hq.com / 123</small><br />
                        <small>Manager: manager@nyc.com / 123</small>
                    </div>
                </form>
            </div>
        </div>
    );
}
