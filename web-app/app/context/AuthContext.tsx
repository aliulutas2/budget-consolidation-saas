'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, logoutUser, getSession } from '../actions/auth';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

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
        // Check session on mount via Server Action
        checkSession();
    }, []);

    const checkSession = async () => {
        const sessionUser = await getSession();
        if (sessionUser) {
            setUser(sessionUser);
        }
        setLoading(false);
    };

    const login = async (email: string, pass: string) => {
        const result = await loginUser(email, pass);
        if (result.success && result.user) {
            setUser(result.user);
            router.push('/dashboard');
        }
        return result;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        router.push('/');
        router.refresh();
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
