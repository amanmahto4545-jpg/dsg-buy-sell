import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.middleware';
import { toggleFavorite, getFavorites } from '../controllers/favorite.controller';

const favoriteRouter = Router();

// All favorite routes are protected
favoriteRouter.use(isAuthenticated);

// POST /api/v1/favorites - Toggle favorite status (expects { productId: string } in body)
favoriteRouter.post('/', toggleFavorite);

// GET /api/v1/favorites - Get all favorite products
favoriteRouter.get('/', getFavorites);

export default favoriteRouter;
