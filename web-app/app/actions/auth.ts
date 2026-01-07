'use server';

import { prisma } from '../lib/prisma';
import { cookies } from 'next/headers';

// Simple Auth Action (In production use NextAuth or similar)
export async function loginUser(email: string, password: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { managedLocations: true } // Fetch their location if they are a manager
        });

        if (!user || user.password !== password) {
            return { success: false, message: 'Invalid credentials' };
        }

        // Extremely basic session: set a cookie with user ID
        // WARNING: NOT SECURE FOR PRODUCTION. Use NextAuth.js or proper JWT.
        (await cookies()).set('budgetone_session', user.id, { httpOnly: true, secure: true });

        // Return user info (strip sensitive data)
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: 'Internal Server Error' };
    }
}

export async function logoutUser() {
    (await cookies()).delete('budgetone_session');
    return { success: true };
}

export async function getSession() {
    const sessionId = (await cookies()).get('budgetone_session')?.value;
    if (!sessionId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: sessionId }
        });
        if (!user) return null;
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
    } catch (error) {
        return null;
    }
}
