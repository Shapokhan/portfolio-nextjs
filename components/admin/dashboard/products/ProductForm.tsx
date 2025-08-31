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
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string; // Cloudinary URL
    imagePublicId?:string
  };
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [imageError, setImageError] = useState<string>('');
  const [removeImage, setRemoveImage] = useState(false); // <-- new flag
  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any, // 👈 fixes resolver mismatch
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      stock: 0,
      imageUrl: '',
      imagePublicId: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setPreview(initialData.imageUrl || null);
      setRemoveImage(false);
    }
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    setRemoveImage(false); // user selected a new file → cancel "remove" intent

    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
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
      // keep the file input so user can re-select
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  const removeImageHandler = () => {
    // mark intent to remove; on submit we'll tell backend with removeImage flag
    setPreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // keep form values consistent (optional)
    setValue('imageUrl', '', { shouldValidate: true });
    setValue('imagePublicId', '', { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', data.price?.toString() || '');
      formData.append('stock', data.stock?.toString() || '');

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        // new file uploaded → backend will replace old image
        formData.append('image', file);
      } else if (isEditMode && removeImage) {
        // no new file and user clicked remove → tell backend to remove
        formData.append('removeImage', 'true');
      }

      // include id in query string (you already do), but including in body is harmless
      if (isEditMode && initialData?.id) {
        formData.append('id', initialData.id);
      }

      const url = isEditMode
        ? `/api/products?id=${initialData?.id}`
        : '/api/products';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save product');

      showToast(
        'success',
        `Product ${isEditMode ? 'updated' : 'created'} successfully!`
      );

      // Reset states
      reset();
      setPreview(null);
      setRemoveImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      router.refresh();
      router.push('/dashboard/products');
    } catch (error: any) {
      showToast(
        'error',
        `Failed to ${isEditMode ? 'update' : 'create'} product`
      );
      showToast('error', error?.message || error);
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
          placeholder="0.00"
          label="Price"
          required
        />

        <PfInputField
          register={register}
          errors={errors}
          name="stock"
          type="number"
          step="1"
          min="1"
          placeholder="0.00"
          label="Stock"
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
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                       file:rounded-md file:border-0 file:text-sm file:font-semibold 
                       file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />

          {imageError && <p className="text-sm text-red-600">{imageError}</p>}

          {preview && (
            <div className="relative inline-block mt-4">
              <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                <Image
                  src={preview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeImageHandler}
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
