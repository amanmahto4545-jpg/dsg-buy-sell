import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// --- 1. POST /api/v1/chat/conversations (Protected) ---
// Initiates a new conversation for a product (or retrieves the existing one)
export const startConversation = async (req: Request, res: Response) => {
    const buyerId = req.userId as string;
    const { productId } = req.body as { productId: string };

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required to start a chat.' });
    }

    try {
        // 1. Get Seller ID from the Product
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { sellerId: true, title: true }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        const sellerId = product.sellerId;

        // Prevent chatting with oneself
        if (buyerId === sellerId) {
            return res.status(400).json({ message: 'Cannot start a chat with yourself.' });
        }

        // 2. Find or Create Conversation
        const conversation = await prisma.conversation.upsert({
            where: { productId_buyerId: { productId, buyerId } },
            update: {},
            create: { productId, buyerId, sellerId },
            include: { product: { select: { title: true } } },
        });

        return res.status(200).json(conversation);
    } catch (error) {
        console.error('Start Conversation Error:', error);
        return res.status(500).json({ message: 'Internal server error starting conversation.' });
    }
};

// --- 2. GET /api/v1/chat/conversations (Protected) ---
// Lists all conversations the user is part of (as buyer or seller)
export const getConversations = async (req: Request, res: Response) => {
    const userId = req.userId as string;

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { buyerId: userId },
                    { sellerId: userId },
                ],
            },
            include: {
                product: { select: { id: true, title: true, images: true, sellerId: true } },
                buyer: { select: { name: true } },
            },
            orderBy: { updatedAt: 'desc' }
        });

        return res.status(200).json(conversations);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        return res.status(500).json({ message: 'Internal server error fetching conversations.' });
    }
};

// --- 3. GET /api/v1/chat/conversations/:id/messages (Protected) ---
// Fetches all messages for a specific conversation
export const getMessages = async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const userId = req.userId as string;

    try {
        // 1. Verify User is a participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
            return res.status(403).json({ message: 'Forbidden: Not a participant in this conversation.' });
        }

        // 2. Fetch messages
        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: { sender: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        return res.status(500).json({ message: 'Internal server error fetching messages.' });
    }
};

// --- 4. POST /api/v1/chat/conversations/:id/messages (Protected) ---
// Sends a new message into a conversation
export const sendMessage = async (req: Request, res: Response) => {
    const conversationId = req.params.id;
    const senderId = req.userId as string;
    const { content } = req.body as { content: string };

    if (!content) {
        return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    try {
        // 1. Verify User is a participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation || (conversation.buyerId !== senderId && conversation.sellerId !== senderId)) {
            return res.status(403).json({ message: 'Forbidden: Not a participant in this conversation.' });
        }

        // 2. Create the message
        const newMessage = await prisma.message.create({
            data: {
                content,
                senderId,
                conversationId,
            },
        });

        // 3. Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error('Send Message Error:', error);
        return res.status(500).json({ message: 'Internal server error sending message.' });
    }
};
