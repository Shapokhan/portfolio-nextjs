import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | My Portfolio',
  description: 'Login or register to access the dashboard',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
        {/* Login or Register page content */}
        {children}
    </div>
  );
}
