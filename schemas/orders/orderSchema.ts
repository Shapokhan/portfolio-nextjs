import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export const orderSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerAddress: z.string().min(1, 'Customer address is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one product is required'),
  employeeId: z.string().min(1, 'Employee is required'),
  totalAmount: z.number().min(0, 'Total amount must be a positive number'),
  status: z.enum(['pending', 'confirmed', 'processing', 'completed', 'cancelled']),
});

export type OrderFormValues = z.infer<typeof orderSchema>;