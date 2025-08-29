'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { showToast } from '@/components/ReusableComponent/ShowToast/ShowToast';
import PfModal from '@/components/pf/pf-modal';
import UserDetail from '@/components/admin/dashboard/users/UserDetail';
import UserDelete from '@/components/admin/dashboard/users/UserDelete';

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
};

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[300px]">
        {row.getValue('email') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('role') || '-'}</div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <div
        className={row.getValue('isActive') ? 'text-green-600' : 'text-red-600'}
      >
        {row.getValue('isActive') ? 'Active' : 'Inactive'}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      const [isDeleting, setIsDeleting] = useState(false);
      const [isDetailOpen, setIsDetailOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
      const router = useRouter();

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`/api/user?id=${user.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            showToast('error', 'Failed to delete user');
          }

          router.refresh();
          showToast('success', 'User deleted successfully');
        } catch (error) {
          showToast('error', 'User Cannot be deleted');
          setIsDelete(false)
        } finally {
          setIsDeleting(false);
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${user.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDetailOpen(true)} // open modal
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={()=> setIsDeleteOpen(true)}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Detail Modal start */}
          <PfModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            title="Product Detail"
          >
            <UserDetail onClose={() => setIsDetailOpen(false)} user={user} />
          </PfModal>
          {/* Detail Modal close */}
          {/* Delete Modal Start */}
          <PfModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            title="Confirm Delete"
          >
            <UserDelete
              onClose={() => setIsDeleteOpen(false)}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </PfModal>
          {/* Delete Modal Close */}
        </>
      );
    },
  },
];
