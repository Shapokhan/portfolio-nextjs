import { Button } from "@/components/ui/button";
import { User, columns } from "./columns";
import { DataTable } from "./data-table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isUndefined } from "util";

const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error('Failed to fetch users');
    }

    const result = await response.json();
    
    // Check if response is paginated (has data property) or direct array
    const users = result.data || result;
    
    return users.map((user: any) => ({
      id: user._id?.toString() || user.id,
      name: user.name,
      email: user.email || '',
      role: user.role || 'employee',
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt
    }));
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
};

const UserPage = async () => {
  const data = await fetchUsers();

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">All Users</h1>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/dashboard/users/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New User
            </Link>
          </Button>
        </div>
        
        {data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No Users found. Create your first user!
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/users/new">
                Create User
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;