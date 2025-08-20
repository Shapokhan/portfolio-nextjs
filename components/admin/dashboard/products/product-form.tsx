"use client";

import Link from "next/link";
import PfButton from "@/components/pf/pf-button";
import PfInputField from "@/components/pf/pf-input-field";
import PfTextarea from "@/components/pf/pf-textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormValues, productSchema } from "@/schemas/products/productSchema";
import { useRouter } from "next/navigation";
import { showToast } from '@/components/ReusableComponent/ShowToast/ShowToast';
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    image?: string; // Base64 encoded image
  };
}


export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || '');
  const [imageError, setImageError] = useState<string>('');
  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: null,
      image: "",
    },
  });

  // Watch the image field to sync with preview
  const watchedImage = watch('image');

  // Sync image preview with form value
  useEffect(() => {
    if (watchedImage && watchedImage !== imagePreview) {
      setImagePreview(watchedImage);
    }
  }, [watchedImage, imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (!file) {
      setImagePreview('');
      setValue('image', '');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setValue('image', base64String, { shouldValidate: true });
    };
    reader.onerror = () => {
      setImageError('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview('');
    setValue('image', '', { shouldValidate: true });
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log('Form data being submitted:', {
        image: data.image,
      });

      const url = isEditMode 
        ? `/api/products?id=${initialData.id}`
        : '/api/products';

      const method = isEditMode ? 'PUT' : 'POST';

      // Prepare the data to send
      const requestData = {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image || '' // Ensure image is always sent (even if empty)
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }
        showToast('success', `Product ${isEditMode ? 'updated' : 'created'} successfully!`);
      reset();
      router.refresh(); // Refresh server components if needed
      router.push('/dashboard/products'); // Redirect to products list
    } catch (error:any) {
      showToast('error', `Failed to ${isEditMode ? 'update' : 'create'} product`)
      showToast('error', error);
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

        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Product Image</label>
          
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          
          {/* Error Message */}
          {imageError && (
            <p className="text-sm text-red-600">{imageError}</p>
          )}
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block mt-4">
              <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Hidden field for react-hook-form - FIXED */}
          <input 
            type="hidden" 
            {...register('image')} 
            value={imagePreview} // This ensures the value is always synced
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