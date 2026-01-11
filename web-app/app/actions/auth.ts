// MOCKED FOR STATIC EXPORT
// 'use server';

// import { prisma } from '../lib/prisma';
// import { cookies } from 'next/headers';

// Simple Auth Action (In production use NextAuth or similar)
export async function loginUser(email: string, password: string) {
    console.warn("MOCK loginUser called");
    if (email === "demo@demo.com" && password === "demo") {
        return {
            success: true,
            user: {
                id: "mock-id",
                email: "demo@demo.com",
                name: "Demo User",
                role: "ADMIN"
            }
        };
    }
    return { success: false, message: 'Static Site: Link not functional' };
}

export async function logoutUser() {
    return { success: true };
}

export async function getSession() {
    return null;
}
