import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { RegisterSchema, LoginSchema } from '../shared/auth.schema';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Utility function to generate JWT
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// --- Public API: User Registration ---
export const registerUser = async (req: Request, res: Response) => {
    try {
        // 1. Input Validation (Zod)
        const validatedInput = RegisterSchema.safeParse(req.body);

        if (!validatedInput.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validatedInput.error.flatten().fieldErrors,
            });
        }

        const { name, email, password, phone, location } = validatedInput.data;

        // 2. Check for existing user
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create User
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                location,
            },
            select: {
                id: true,
                name: true,
                email: true,
                location: true,
                createdAt: true
            },
        });

        // 5. Generate JWT and respond
        const token = generateToken(newUser.id);

        return res.status(201).json({
            token,
            user: newUser,
            message: 'Registration successful',
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

// --- Public API: User Login ---
export const loginUser = async (req: Request, res: Response) => {
    try {
        // 1. Input Validation (Zod)
        const validatedInput = LoginSchema.safeParse(req.body);

        if (!validatedInput.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validatedInput.error.flatten().fieldErrors,
            });
        }

        const { email, password } = validatedInput.data;

        // 2. Find User by Email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Compare Passwords (bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 4. Generate JWT
        const token = generateToken(user.id);

        // 5. Respond with Token and User data (excluding password)
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            location: user.location,
        };

        return res.status(200).json({
            token,
            user: userResponse,
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
};

// --- Protected API: GET /api/v1/auth/me ---
export const getUserProfile = async (req: Request, res: Response) => {
    const userId = req.userId as string;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                location: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Get Profile Error:', error);
        return res.status(500).json({ message: 'Internal server error fetching profile.' });
    }
};

// --- Protected API: PUT /api/v1/auth/me ---
export const updateUserProfile = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const { name, phone, location } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, phone, location },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                location: true,
            },
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({ message: 'Internal server error updating profile.' });
    }
};
