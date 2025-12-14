import { z } from 'zod';

// -----------------------------------------------------
// Registration Schema: Validates user input during signup
// -----------------------------------------------------
export const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
    email: z.string().email('Invalid email address.').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    phone: z.string().optional(), // Can be null/omitted
    location: z.string().min(2, 'Location (city) is required.'),
});

// -----------------------------------------------------
// Type Definitions (for use in controllers)
// -----------------------------------------------------
export type RegisterInput = z.infer<typeof RegisterSchema>;

// -----------------------------------------------------
// Login Schema
// -----------------------------------------------------
export const LoginSchema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
