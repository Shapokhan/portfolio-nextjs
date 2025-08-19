'use client';
import Link from 'next/link';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';
import PfCheckbox from '@/components/pf/pf-checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormValues, loginSchema } from '@/schemas/auth/loginSchema';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { showToast } from '../../../../components/ReusableComponent/ShowToast/ShowToast';
import { mapAuthError } from '@/lib/authErrors';

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    const res = await signIn('credentials', {
      redirect: false, // we control redirect manually
      email: data.email,
      password: data.password,
    });
    if (res?.error) {
      showToast('error', mapAuthError(res.error));
    } else {
      showToast('success', 'Login Successful');
      router.push('/dashboard'); // redirect after login
    }
  };
  return (
    <>
      <p className="text-lg font-medium mb-2">Login</p>
      <p className="text-sm font-small mb-2">
        Welcome back! Please enter your details.
      </p>

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
        <div className="space-y-1">
          <PfInputField
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            register={register}
            required
            errors={errors}
          />
        </div>
        <PfCheckbox id="remember" name="remember" label="Remember me" />
        <PfButton className="w-full" variant="default" type="submit">
          Login
        </PfButton>
        <div className="flex justify-between text-md">
          <Link href="/forgot-password" className="hover:underline text-md">
            Forgot Password?
          </Link>
          <Link href="/register" className="hover:underline text-md">
            Register?
          </Link>
        </div>
      </form>
    </>
  );
}
