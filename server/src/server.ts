import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import productRouter from './routes/product.routes';
import categoryRouter from './routes/category.routes';
import chatRouter from './routes/chat.routes';
import { seedCategories } from './data/categories.data';
import prisma from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Seed categories on startup (Development)
seedCategories(prisma).catch(e => console.error('Category Seeding Failed:', e));

app.use(express.json());

// --- API Routes ---
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/chat', chatRouter);

app.get('/', (_req: Request, res: Response) => {
    res.send('DSG Buy & Sell API is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
