import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// --- Public API: Get all categories ---
export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            select: { id: true, name: true },
            orderBy: { id: 'asc' },
        });
        return res.status(200).json(categories);
    } catch (error) {
        console.error('Get Categories Error:', error);
        return res.status(500).json({ message: 'Internal server error fetching categories.' });
    }
};
