import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USERS = [
    { email: 'admin@hq.com', password: '123', role: 'ADMIN', name: 'Can (Admin)' },
    { email: 'manager@london.com', password: '123', role: 'LOCATION_MANAGER', name: 'John (London)' },
    { email: 'manager@istanbul.com', password: '123', role: 'LOCATION_MANAGER', name: 'Ayşe (Istanbul)' }
];

const CATEGORIES = [
    // Revenue
    { code: '100', name: 'Revenue', type: 'INCOME' },
    { code: '100.01', name: 'New Business Subscription Revenue', parentCode: '100' },
    { code: '100.02', name: 'Renewal Subscription Revenue', parentCode: '100' },

    // COGS
    { code: '200', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE' },
    { code: '200.01', name: 'Public Cloud Infrastructure (Production)', parentCode: '200' },
    { code: '200.02', name: 'Content Delivery Network (CDN) Fees', parentCode: '200' },

    // R&D
    { code: '300', name: 'Research & Development (R&D)', type: 'EXPENSE' },
    { code: '300.01', name: 'Software Engineering Salaries', parentCode: '300' },

    // S&M
    { code: '400', name: 'Sales & Marketing (S&M)', type: 'EXPENSE' },
    { code: '400.01', name: 'Sales Base Salaries', parentCode: '400' },
];

async function main() {
    console.log('Seeding...');

    // 1. Users
    for (const u of USERS) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
        console.log(`User created: ${user.email}`);
    }

    // 2. Locations
    const managerLdn = await prisma.user.findUnique({ where: { email: 'manager@london.com' } });
    const managerIst = await prisma.user.findUnique({ where: { email: 'manager@istanbul.com' } });

    if (managerLdn) {
        await prisma.location.upsert({
            where: { id: 'loc_ldn' },
            update: {},
            create: { id: 'loc_ldn', name: 'London HQ', currency: 'GBP', managerId: managerLdn.id }
        });
    }
    if (managerIst) {
        await prisma.location.upsert({
            where: { id: 'loc_ist' },
            update: {},
            create: { id: 'loc_ist', name: 'Istanbul Branch', currency: 'TRY', managerId: managerIst.id }
        });
    }

    // 3. Categories
    // Create parents first
    const parentCats = CATEGORIES.filter(c => !c.parentCode);
    for (const c of parentCats) {
        await prisma.category.create({
            data: {
                code: c.code,
                name: c.name,
                type: c.type
            }
        });
    }

    // Create children
    const childCats = CATEGORIES.filter(c => c.parentCode);
    for (const c of childCats) {
        const parent = await prisma.category.findFirst({ where: { code: c.parentCode } });
        if (parent) {
            await prisma.category.create({
                data: {
                    code: c.code,
                    name: c.name,
                    parentId: parent.id
                }
            });
        }
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
