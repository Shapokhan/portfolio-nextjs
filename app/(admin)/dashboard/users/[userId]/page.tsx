import UserForm from '@/components/admin/dashboard/users/user-form';
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { notFound } from 'next/navigation';

export const dynamicParams = true; // Enable dynamic params

interface PageProps {
  params: Promise<{ userId: string }>; // params is now a Promise
}

export default async function EditUserPage({
  params,
}: PageProps) {
  // Await params before accessing its properties
  const { userId } = await params;
  
  // Validate userId format first
  if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
    return notFound();
  }

  try {
    await connectToDatabase();
    const user = await User.findById(userId).lean();

    if (!user) {
      return notFound();
    }

    return (
      <div className="">
        <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">Edit User {JSON.stringify(user.name)}</h1>
        </div>
        <UserForm 
          initialData={{
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'employee',
            isActive: user.isActive !== undefined ? user.isActive : true,
          }} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return notFound();
  }
}