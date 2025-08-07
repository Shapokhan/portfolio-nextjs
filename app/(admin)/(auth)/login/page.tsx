import Link from 'next/link';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';
import PfCheckbox from '@/components/pf/pf-checkbox';

export default function Login() {
  return (
    <>
      <p className="text-lg font-medium mb-4">Login to your account</p>

      <form className="space-y-4">
        <div className="space-y-1">
          <PfInputField name="email" label="Email" id="email" />
        </div>
        <div className="space-y-1">
          <PfInputField
            name="password"
            label="Password"
            id="password"
            type="password"
          />
        </div>
        <PfCheckbox id="remember" name="remember" label="Remember me" />
        <PfButton variant="default" className="w-full">
          Login
        </PfButton>
        <div className="flex justify-between text-md">
          <Link href="/forgot-password" className="hover:underline">
            Forgot Password?
          </Link>
          <Link href="/register" className="hover:underline">
            Register?
          </Link>
        </div>
      </form>
    </>
  );
}
