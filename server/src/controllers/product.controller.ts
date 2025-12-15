import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { CreateProductSchema } from '../shared/product.schema';

// --- 1. POST /api/v1/products (Protected) ---
export const createProduct = async (req: Request, res: Response) => {
    const sellerId = req.userId as string;

    try {
        const validatedInput = CreateProductSchema.safeParse(req.body);
        if (!validatedInput.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validatedInput.error.flatten().fieldErrors,
            });
        }

        const { title, description, price, location, images, categoryId } = validatedInput.data;

        const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid category ID.' });
        }

        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                price,
                location,
                images,
                categoryId,
                sellerId,
            },
        });

        return res.status(201).json(newProduct);
    } catch (error) {
        console.error('Create Product Error:', error);
        return res.status(500).json({ message: 'Internal server error during product creation.' });
    }
};

// --- 2. GET /api/v1/products (Public - Advanced Querying) ---
export const getProducts = async (req: Request, res: Response) => {
    // 1. Parse Query Parameters
    const { page, limit, search, categoryId, location, sortBy } = req.query as {
        page?: string;
        limit?: string;
        search?: string;
        categoryId?: string;
        location?: string;
        sortBy?: 'priceAsc' | 'priceDesc' | 'newest';
    };

    const pageNumber = parseInt(page || '1');
    const pageSize = parseInt(limit || '20');
    const skip = (pageNumber - 1) * pageSize;

    // 2. Build Dynamic WHERE Clause
    const where: any = { isSold: false };

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (categoryId) {
        where.categoryId = parseInt(categoryId);
    }

    if (location) {
        where.location = { equals: location, mode: 'insensitive' };
    }

    // 3. Build ORDER BY Clause
    let orderBy: any = { createdAt: 'desc' };

    switch (sortBy) {
        case 'priceAsc':
            orderBy = { price: 'asc' };
            break;
        case 'priceDesc':
            orderBy = { price: 'desc' };
            break;
        case 'newest':
        default:
            orderBy = { createdAt: 'desc' };
            break;
    }

    // 4. Execute Query with Pagination, Search, Filter, and Sort
    try {
        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                seller: { select: { id: true, name: true, location: true } }
            },
            orderBy,
            skip,
            take: pageSize,
        });

        return res.status(200).json(products);
    } catch (error) {
        console.error('Advanced Get Products Error:', error);
        return res.status(500).json({ message: 'Internal server error fetching products.' });
    }
};

// --- 3. GET /api/v1/products/:id (Public) ---
export const getProductById = async (req: Request, res: Response) => {
    const productId = req.params.id;

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        profilePhoto: true,
                        location: true
                    }
                }
            },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error('Get Product By ID Error:', error);
        return res.status(500).json({ message: 'Internal server error fetching product details.' });
    }
};

// --- 4. PUT /api/v1/products/:id (Protected) ---
export const updateProduct = async (req: Request, res: Response) => {
    const productId = req.params.id;
    const sellerId = req.userId as string;

    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (product.sellerId !== sellerId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this product.' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: req.body,
        });

        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Update Product Error:', error);
        return res.status(500).json({ message: 'Internal server error during update.' });
    }
};

// --- 5. DELETE /api/v1/products/:id (Protected) ---
export const deleteProduct = async (req: Request, res: Response) => {
    const productId = req.params.id;
    const sellerId = req.userId as string;

    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(204).send();
        }
        if (product.sellerId !== sellerId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this product.' });
        }

        // Delete related records first (to avoid foreign key constraint errors)
        // 1. Delete all favorites for this product
        await prisma.favorite.deleteMany({ where: { productId } });

        // 2. Delete all messages in conversations for this product
        const conversations = await prisma.conversation.findMany({ where: { productId } });
        for (const conv of conversations) {
            await prisma.message.deleteMany({ where: { conversationId: conv.id } });
        }

        // 3. Delete all conversations for this product
        await prisma.conversation.deleteMany({ where: { productId } });

        // 4. Finally delete the product
        await prisma.product.delete({ where: { id: productId } });

        return res.status(204).send();
    } catch (error) {
        console.error('Delete Product Error:', error);
        return res.status(500).json({ message: 'Internal server error during deletion.' });
    }
};

// --- 6. PATCH /api/v1/products/:id/sold (Protected: Mark Item as Sold) ---
export const markAsSold = async (req: Request, res: Response) => {
    const productId = req.params.id;
    const sellerId = req.userId as string;

    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (product.sellerId !== sellerId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this product.' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { isSold: true },
        });

        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Mark As Sold Error:', error);
        return res.status(500).json({ message: 'Internal server error marking product as sold.' });
    }
};
