import Link from 'next/link';
import PfCheckbox from '@/components/pf/pf-checkbox';
import PfButton from '@/components/pf/pf-button';
import PfInputField from '@/components/pf/pf-input-field';

export default function Register() {
  return (
    <>
      <p className="text-lg font-medium mb-4">Create your account</p>
      <form className="space-y-4">
        <PfInputField name="name" label="Name" id="name" />
        <PfInputField name="email" label="Email" id="email" />
        <PfInputField
          name="password"
          label="Password"
          id="password"
          type="password"
        />
        <PfCheckbox id="remember" name="remember" label="Remember me" />
        <PfButton className="w-full" variant="default">
          Register
        </PfButton>
        <div className="flex justify-between text-md">
          <Link href="/forgot-password" className="hover:underline">
            Forgot Password?
          </Link>
          <Link href="/login" className="hover:underline">
            Login?
          </Link>
        </div>
      </form>
    </>
  );
}
