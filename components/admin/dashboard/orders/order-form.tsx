'use client';

import Link from 'next/link';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';
import PfTextarea from '@/components/pf/pf-textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/ReusableComponent/ShowToast/ShowToast';
import { useState, useEffect } from 'react';
import { OrderFormValues, orderSchema } from '@/schemas/orders/orderSchema';

interface OrderFormProps {
  initialData?: {
    id?: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      imageUrl: string;
      imagePublicId: string;
    }>;
    employeeId: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  imagePublicId: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export default function OrderForm({ initialData }: OrderFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialData || {
      customerName: '',
      customerAddress: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
      items: [],
      employeeId: '',
      totalAmount: 0,
      status: 'pending',
    },
  });

  // Watch form values
  const items = watch('items');
  const employeeId = watch('employeeId');
  const totalAmount = watch('totalAmount');

  // Auto-update total when items change
  useEffect(() => {
    updateTotalAmount();
  }, [items]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, employeesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/user?isActive=true'), // Changed to employees endpoint
        ]);

        if (!productsRes.ok) {
          throw new Error('Failed to fetch products');
        }

        if (!employeesRes.ok) {
          throw new Error('Failed to fetch employees');
        }

        const productsData = await productsRes.json();
        const employeesData = await employeesRes.json();

        // Handle different response structures
        const productsArray = Array.isArray(productsData) 
          ? productsData 
          : productsData.data || [];
        
        const employeesArray = Array.isArray(employeesData) 
          ? employeesData 
          : employeesData.data || [];

        setProducts(productsArray);
        setEmployees(employeesArray);

        // Pre-fill form if in edit mode
        if (initialData) {
          reset(initialData);
          // Initialize selected products
          const selected: { [key: string]: number } = {};
          initialData.items.forEach(item => {
            selected[item.productId] = item.quantity;
          });
          setSelectedProducts(selected);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('error', 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData, reset]);

  const addProductToOrder = (product: Product) => {
    const existingItemIndex = items.findIndex(
      item => item.productId === product._id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...items];
      const newQuantity = updatedItems[existingItemIndex].quantity + 1;
      
      if (newQuantity > product.stock) {
        showToast('error', `Only ${product.stock} items available in stock`);
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      setValue('items', updatedItems, { shouldValidate: true });
      setSelectedProducts(prev => ({
        ...prev,
        [product._id]: newQuantity,
      }));
    } else {
      // Add new product to order
      const newItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        imagePublicId: product.imagePublicId,
      };
      
      const updatedItems = [...items, newItem];
      setValue('items', updatedItems, { shouldValidate: true });
      setSelectedProducts(prev => ({
        ...prev,
        [product._id]: 1,
      }));
    }
  };

  const updateProductQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeProductFromOrder(productId);
      return;
    }

    const product = products.find(p => p._id === productId);
    if (product && newQuantity > product.stock) {
      showToast('error', `Only ${product.stock} items available in stock`);
      return;
    }

    const updatedItems = items.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );

    setValue('items', updatedItems, { shouldValidate: true });
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const removeProductFromOrder = (productId: string) => {
    const updatedItems = items.filter(item => item.productId !== productId);
    setValue('items', updatedItems, { shouldValidate: true });
    
    const { [productId]: removed, ...rest } = selectedProducts;
    setSelectedProducts(rest);
  };

  const updateTotalAmount = () => {
    const total = items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    setValue('totalAmount', total, { shouldValidate: true });
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      const url = isEditMode
        ? `/api/orders?id=${initialData.id}`
        : '/api/orders';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save order');
      }

      showToast(
        'success',
        `Order ${isEditMode ? 'updated' : 'created'} successfully!`
      );
      reset();
      router.refresh();
      router.push('/dashboard/orders');
    } catch (error: any) {
      console.error('Error saving order:', error);
      showToast('error', error.message || `Failed to ${isEditMode ? 'update' : 'create'} order`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isEditMode && (
          <input type="hidden" {...register('id')} value={initialData?.id} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Customer Information</h2>
            
            <PfInputField
              register={register}
              errors={errors}
              name="customerName"
              placeholder="Enter customer name"
              label="Customer Name"
              required
            />

            <PfTextarea
              register={register}
              errors={errors}
              name="customerAddress"
              placeholder="Enter customer address"
              label="Address"
              required
            />

            <PfInputField
              register={register}
              errors={errors}
              name="customerPhone"
              placeholder="Enter phone number"
              label="Phone Number"
              required
            />

            <PfInputField
              register={register}
              errors={errors}
              name="customerEmail"
              type="email"
              placeholder="Enter email address"
              label="Email (Optional)"
            />

            <PfTextarea
              register={register}
              errors={errors}
              name="notes"
              placeholder="Additional notes about the order"
              label="Order Notes (Optional)"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Assigned Employee <span className="text-sm text-red-600 dark:text-red-400">*</span></label>
              <select
                {...register('employeeId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                required
              >
                <option value="">Select an employee</option>
                {Array.isArray(employees) && employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.employeeId.message}</p>
              )}
            </div>

            {isEditMode && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Order Status</label>
                <select
                  {...register('status')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Product Selection</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Available Products</label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto dark:border-gray-700">
                {Array.isArray(products) && products.filter(p => p.stock > 0).map(product => (
                  <div key={product._id} className="flex justify-between items-center py-2 border-b last:border-b-0 dark:border-gray-700">
                    <div className="flex-1">
                      <p className="font-medium dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${product.price.toFixed(2)} • Stock: {product.stock}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProductToOrder(product)}
                      disabled={product.stock === 0}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
                {Array.isArray(products) && products.filter(p => p.stock > 0).length === 0 && (
                  <p className="text-gray-500 text-center py-4 dark:text-gray-400">No products available</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Order Items</label>
              {items.length === 0 ? (
                <p className="text-gray-500 italic p-3 border rounded-md dark:text-gray-400 dark:border-gray-700">No products added to order</p>
              ) : (
                <div className="border rounded-md divide-y dark:border-gray-700">
                  {items.map(item => {
                    const product = Array.isArray(products) ? products.find(p => p._id === item.productId) : null;
                    const maxQuantity = product ? product.stock : 0;
                    
                    return (
                      <div key={item.productId} className="p-3 flex justify-between items-center dark:border-gray-700">
                        <div className="flex-1">
                          <p className="font-medium dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateProductQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= maxQuantity}
                            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                              item.quantity >= maxQuantity 
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            +
                          </button>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProductFromOrder(item.productId)}
                          className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  <div className="p-3 flex justify-between font-bold bg-gray-50 dark:bg-gray-800">
                    <span className="dark:text-white">Total:</span>
                    <span className="dark:text-white">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
              {errors.items && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.items.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
          <Link href="/dashboard/orders">
            <PfButton variant="outline" type="button">
              Cancel
            </PfButton>
          </Link>
          <PfButton 
            variant="default" 
            type="submit"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Order'
              : 'Create Order'}
          </PfButton>
        </div>
      </form>
    </div>
  );
}