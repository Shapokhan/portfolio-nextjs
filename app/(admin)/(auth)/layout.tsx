import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | My Portfolio",
  description: "Login or register to access the dashboard",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen flex justify-center items-center">
      <div className="border border-slate-200 bg-white rounded-md p-5 w-96">
        {children}
      </div>
    </main>
  );
}

