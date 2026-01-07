'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User } from '@/app/lib/store';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check session on mount
        const currentUser = db.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const result = await db.login(email, pass);
        if (result.success && result.user) {
            setUser(result.user);
            router.push('/dashboard');
        }
        return result;
    };

    const logout = () => {
        db.logout();
        setUser(null);
        router.push('/'); // Go to landing page
        router.refresh(); // Ensure state cleans up
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
