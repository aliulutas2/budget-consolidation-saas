// MOCKED FOR STATIC EXPORT
// 'use server';

// import { prisma } from '../lib/prisma';
// import { getSession } from './auth';

export async function getCategories() {
    return [
        { id: '1', name: 'Software', code: 'SW-01' },
        { id: '2', name: 'Cloud', code: 'CL-01' }
    ];
}

export async function getLocations() {
    return [
        { id: '1', name: 'Istanbul HQ', managerId: 'mock-id' },
        { id: '2', name: 'Ankara Branch', managerId: 'mock-id-2' }
    ];
}

export async function getLocationByManager(userId: string) {
    return { id: '1', name: 'Istanbul HQ', managerId: userId };
}

export async function getBudgets(locationId?: string) {
    return [];
}

export async function saveBudgetEntry(entry: any) {
    console.warn("MOCK saveBudgetEntry called - static site");
    return { success: true };
}

export async function getConsolidatedReport() {
    return [];
}
