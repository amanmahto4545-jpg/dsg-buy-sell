import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.middleware';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    markAsSold
} from '../controllers/product.controller';

const productRouter = Router();

// Public Routes (Accessible by anyone)
productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);

// Protected Routes (Requires valid JWT)
productRouter.post('/', isAuthenticated, createProduct);
productRouter.put('/:id', isAuthenticated, updateProduct);
productRouter.delete('/:id', isAuthenticated, deleteProduct);
productRouter.patch('/:id/sold', isAuthenticated, markAsSold);

export default productRouter;
