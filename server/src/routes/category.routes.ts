import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';

const categoryRouter = Router();

// Public route: GET /api/v1/categories
categoryRouter.get('/', getCategories);

export default categoryRouter;
