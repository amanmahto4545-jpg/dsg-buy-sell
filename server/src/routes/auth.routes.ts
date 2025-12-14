import { Router } from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const authRouter = Router();

// Public route: POST /api/v1/auth/register
authRouter.post('/register', registerUser);

// Public route: POST /api/v1/auth/login
authRouter.post('/login', loginUser);

// Protected route: GET /api/v1/auth/me
authRouter.get('/me', isAuthenticated, getUserProfile);

// Protected route: PUT /api/v1/auth/me
authRouter.put('/me', isAuthenticated, updateUserProfile);

export default authRouter;
