'use client';

import Link from 'next/link';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RegisterFormValues as UserFormValues,
  registerSchema as userSchema,
} from '@/schemas/auth/registerSchema';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/ReusableComponent/ShowToast/ShowToast';
import { useEffect } from 'react';

interface UserFormProps {
  initialData?: {
    id?: string;
    name: string;
    email: string;
    role?: 'admin' | 'employee' | 'user';
    isActive?: boolean;
  };
}

export default function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'employee',
      isActive: true,
      password: 'password',
      passwordConfirm: 'password',
    },
  });

  // Watch the isActive value for debugging
  const isActiveValue = watch('isActive');
  console.log('isActive value:', isActiveValue);

  // Set initial data when in edit mode
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data:', initialData);
      reset({
        ...initialData,
        password: 'password',
        passwordConfirm: 'password',
        role: initialData.role || 'employee',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Prepare the data to send
      const formData = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        // Only include password for new users
        ...(!isEditMode && { 
          password: data.password,
          passwordConfirm: data.passwordConfirm 
        }),
      };

      const url = isEditMode
        ? `/api/user?id=${initialData.id}`
        : '/api/user/register';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save user');

      showToast(
        'success',
        `User ${isEditMode ? 'updated' : 'created'} successfully!`
      );
      reset();
      router.refresh();
      router.push('/dashboard/users');
    } catch (error: any) {
      showToast(
        'error',
        `Failed to ${isEditMode ? 'update' : 'create'} user`
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
          placeholder="Enter user name"
          label="User Name"
          required
        />

        <PfInputField
          register={register}
          errors={errors}
          name="email"
          placeholder="Enter user email"
          label="Email"
          type='email'
          required
        />

        {/* Add role selection field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <select
            {...register('role')}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="user">User</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        {/* Add active status toggle - FIXED: Use proper checkbox registration */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            {isEditMode ? 'Active User' : 'User is Active'}
          </label>
        </div>
        {errors.isActive && (
          <p className="text-sm text-destructive">{errors.isActive.message}</p>
        )}

        {/* Hidden password fields with default values */}
        <input type="hidden" {...register('password')} value="password" />
        <input type="hidden" {...register('passwordConfirm')} value="password" />

        <div className="flex justify-end gap-4 pt-2">
          <Link href="/dashboard/users">
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
              ? 'Update User'
              : 'Create User'}
          </PfButton>
        </div>
      </form>
    </div>
  );
}