'use client';
import Link from 'next/link';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordFormValues, forgotPasswordSchema } from '@/schemas/auth/forgotPasswordSchema';

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    console.log('Form submitted:', data);
    // Send `data` to API where you will hash the password
  };
  return (
    <>
      <p className="text-lg font-medium mb-2">Forgot Password</p>
      <p className="text-sm font-small mb-2">If that email is in our system, you’ll receive an email with password reset instructions shortly.</p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <PfInputField
            register={register}
            errors={errors}
            name="email"
            placeholder="Enter your email"
            label="Email"
            required
          />
        </div>
        <PfButton className="w-full" variant="default" type="submit">
          Send Reset Link
        </PfButton>
        <div className="flex justify-between text-md">
          <Link href="/login" className="hover:underline">
            Login?
          </Link>
          <Link href="/register" className="hover:underline">
            Register?
          </Link>
        </div>
      </form>
    </>
  );
}
