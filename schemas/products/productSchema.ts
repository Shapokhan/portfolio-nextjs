import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(1, { message: "Price must be at least 1" })
});

export type ProductFormValues = z.infer<typeof productSchema>;