import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Extend the Express Request type to include our custom property
declare global {
    namespace Express {
        interface Request {
            userId?: string; // The ID of the authenticated user
        }
    }
}

// --- Middleware: Check for valid JWT ---
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    // 1. Check for token in the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verify token and decode payload
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // 4. Attach user ID to the request for controller use
        req.userId = decoded.userId;

        // 5. Proceed to the next middleware/controller
        next();
    } catch (ex) {
        // Handle invalid token
        res.status(403).json({ message: 'Invalid token.' });
    }
};
