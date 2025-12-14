import { z } from 'zod';

// --- Product Categories (Predefined by user request) ---
export const CATEGORIES = [
    'Cars',
    'Bikes',
    'Electronics',
    'Mobiles',
    'Furniture',
    'Home Appliances',
    'Others'
] as const;

// -----------------------------------------------------
// Schema for creating a new product listing
// -----------------------------------------------------
export const CreateProductSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
    description: z.string().min(20, 'Description must be at least 20 characters.').max(1000),
    price: z.number().positive('Price must be a positive number.'),
    location: z.string().min(2, 'Location is required.'),

    // images is a list of URLs from the frontend upload
    images: z.array(z.string().url('Invalid image URL.')).min(1, 'At least one image is required.'),

    // categoryId is an integer ID linked to the Category table
    categoryId: z.number().int('Category ID must be an integer.').positive('Invalid Category ID.'),
});

// Type Definition
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
