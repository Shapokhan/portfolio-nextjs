'use client';
import Link from 'next/link';
import PfCheckbox from '@/components/pf/pf-checkbox';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RegisterFormValues,
  registerSchema,
} from '@/schemas/auth/registerSchema';
import { showToast } from '../../../../components/ReusableComponent/ShowToast/ShowToast';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // includes passwordConfirm
      });
      const result = await res.json();
      if (res.ok) {
        showToast('success', result.message || 'User registered successfully!');
      } else {
        showToast('error', result.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error. Please try again.');
    }
  };
  return (
    <>
      <p className="text-lg font-medium mb-2">Create Account</p>
      <p className="text-sm font-small mb-2">Sign up to get started.</p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <PfInputField
          register={register}
          errors={errors}
          name="name"
          placeholder="Enter your full name"
          label="Full Name"
          required
        />
        <PfInputField
          register={register}
          errors={errors}
          name="email"
          placeholder="Enter your email"
          label="Email"
          required
        />
        <PfInputField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          register={register}
          required
          errors={errors}
        />
        <PfInputField
          name="passwordConfirm"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          register={register}
          required
          errors={errors}
        />
        <PfCheckbox id="remember" name="remember" label="Remember me" />
        <PfButton className="w-full" variant="default" type="submit">
          Register
        </PfButton>
        <Link href="/login" className="hover:underline">
          Already have an account? Login
        </Link>
      </form>
    </>
  );
}
