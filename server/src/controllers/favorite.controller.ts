import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// --- 1. POST /api/v1/favorites (Protected) ---
// Toggles a product's favorite status for the authenticated user
export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId as string;
    const { productId } = req.body as { productId: string };

    if (!productId) {
        res.status(400).json({ message: 'Product ID is required.' });
        return;
    }

    try {
        // Check if the favorite already exists
        const existingFavorite = await prisma.favorite.findUnique({
            where: { userId_productId: { userId, productId } },
        });

        if (existingFavorite) {
            // If it exists, remove it (UNFAVORITE)
            await prisma.favorite.delete({
                where: { userId_productId: { userId, productId } },
            });
            res.status(200).json({ favorited: false, message: 'Removed from favorites.' });
            return;
        } else {
            // If it doesn't exist, create it (FAVORITE)
            await prisma.favorite.create({
                data: { userId, productId },
            });
            res.status(201).json({ favorited: true, message: 'Added to favorites.' });
            return;
        }
    } catch (error) {
        console.error('Toggle Favorite Error:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        res.status(500).json({ message: 'Internal server error during favorite operation.', error: String(error) });
    }
};

// --- 2. GET /api/v1/favorites (Protected) ---
// Lists all favorited products for the authenticated user
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId as string;

    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            select: {
                product: {
                    // Select all fields needed for the ProductCard display
                    include: {
                        category: true,
                        seller: { select: { name: true, location: true } }
                    }
                }
            },
            orderBy: { product: { createdAt: 'desc' } }
        });

        // Return just the array of products
        const favoriteProducts = favorites.map(f => f.product);

        res.status(200).json(favoriteProducts);
    } catch (error) {
        console.error('Get Favorites Error:', error);
        res.status(500).json({ message: 'Internal server error fetching favorites.' });
    }
};
