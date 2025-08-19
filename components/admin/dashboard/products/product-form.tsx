"use client";

import Link from "next/link";
import PfButton from "@/components/pf/pf-button";
import PfInputField from "@/components/pf/pf-input-field";
import PfTextarea from "@/components/pf/pf-textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormValues, productSchema } from "@/schemas/products/productSchema";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
  };
}


export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();

  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: null,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const url = isEditMode 
        ? `/api/products?id=${initialData.id}`
        : '/api/products';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      console.log(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
      reset();
      router.refresh(); // Refresh server components if needed
      router.push('/dashboard/products'); // Redirect to products list
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="rounded-md border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden ID field for edit mode */}
        {isEditMode && (
          <input type="hidden" {...register('id')} value={initialData.id} />
        )}
        <div className="space-y-2">
          <PfInputField
            register={register}
            errors={errors}
            name="name"
            placeholder="Enter product name"
            label="Product Name"
            required
          />
        </div>

        <div className="space-y-2">
          <PfTextarea
            register={register}
            errors={errors}
            name="description"
            placeholder="Enter product description"
            label="Description"
          />
        </div>

        <div className="space-y-2">
          <PfInputField
            register={register}
            errors={errors}
            name="price"
            type="number"
            step="1"
            min="1"
            placeholder="0.00"
            label="Price"
            required
          />
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Link href="/dashboard/products">
            <PfButton variant="outline" type="button">
              Cancel
            </PfButton>
          </Link>
          <PfButton
            variant="default"
            type="submit"
          >
            {isSubmitting 
              ? isEditMode 
                ? 'Updating...' 
                : 'Creating...'
              : isEditMode 
                ? 'Update Product' 
                : 'Create Product'}
          </PfButton>
        </div>
      </form>
    </div>
  );
}