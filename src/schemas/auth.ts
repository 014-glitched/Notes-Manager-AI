import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name must be less than 50 characters'),

  email: z.email('Please enter a valid email address'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string()
})