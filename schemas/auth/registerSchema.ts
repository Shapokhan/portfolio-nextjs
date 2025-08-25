import * as z from 'zod';

export const registerSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string().min(6, 'Password confirmation is required'),
    role: z.enum(['admin', 'employee', 'user']).default('admin'),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
