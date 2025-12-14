import { PrismaClient } from '@prisma/client';
import { CATEGORIES } from '../shared/product.schema';

// Function to seed categories into the database
export async function seedCategories(prisma: PrismaClient) {
    console.log('Seeding categories...');
    for (const name of CATEGORIES) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log('Categories seeded successfully.');
}
