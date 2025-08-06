import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Register() {
  return (
    <>
      <p className="text-lg font-medium mb-4">Create your account</p>

      <form className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input type="text" id="name" placeholder="Name" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" placeholder="Email" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" placeholder="Password" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" />
          <Label htmlFor="remember" className="cursor-pointer">
            Remember me
          </Label>
        </div>

        <Button className="w-full">Register</Button>

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
