'use client';

import Link from 'next/link';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';
import PfTextarea from '@/components/pf/pf-textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProductFormValues,
  productSchema,
} from '@/schemas/products/productSchema';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/ReusableComponent/ShowToast/ShowToast';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string; // Cloudinary URL
    imagePublicId?:string
  };
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      price: null,
      imageUrl: '',
      imagePublicId: '',
    },
  });

  // Watch image field directly
  const imageUrl = watch('imageUrl');

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        imageUrl: watch('imageUrl') || initialData.imageUrl || '',
      });
    }
  }, [initialData, reset, watch]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (!file) {
      setValue('imageUrl', '', { shouldValidate: true });
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Cloudinary upload failed');

      const data = await res.json();
      setValue('imageUrl', data.secure_url, { shouldValidate: true });
      setValue('imagePublicId', data.public_id, { shouldValidate: true });
    } catch (err) {
      console.error(err);
      setImageError('Failed to upload image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setValue('imageUrl', '', { shouldValidate: true });
    setValue('imagePublicId', '', { shouldValidate: true });
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: ProductFormValues) => {
    const finalData = {
      ...data,
      imageUrl: watch('imageUrl') || data.imageUrl || '',
      imagePublicId: watch('imagePublicId') || data.imagePublicId || '',
    };

    console.log('Submitting product:', finalData); // should now always include imageUrl

    try {
      const url = isEditMode
        ? `/api/products?id=${initialData.id}`
        : '/api/products';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error('Failed to save product');

      showToast(
        'success',
        `Product ${isEditMode ? 'updated' : 'created'} successfully!`
      );
      reset();
      router.refresh();
      router.push('/dashboard/products');
    } catch (error: any) {
      showToast(
        'error',
        `Failed to ${isEditMode ? 'update' : 'create'} product`
      );
      showToast('error', error.message || error);
    }
  };

  return (
    <div className="rounded-md border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isEditMode && (
          <input type="hidden" {...register('id')} value={initialData?.id} />
        )}

        <PfInputField
          register={register}
          errors={errors}
          name="name"
          placeholder="Enter product name"
          label="Product Name"
          required
        />

        <PfTextarea
          register={register}
          errors={errors}
          name="description"
          placeholder="Enter product description"
          label="Description"
        />

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

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Product Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                       file:rounded-md file:border-0 file:text-sm file:font-semibold 
                       file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />

          {imageError && <p className="text-sm text-red-600">{imageError}</p>}
          {uploading && (
            <p className="text-sm text-gray-500">Uploading image...</p>
          )}

          {imageUrl && (
            <div className="relative inline-block mt-4">
              <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full 
                           w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Link href="/dashboard/products">
            <PfButton variant="outline" type="button">
              Cancel
            </PfButton>
          </Link>
          <PfButton variant="default" type="submit">
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
