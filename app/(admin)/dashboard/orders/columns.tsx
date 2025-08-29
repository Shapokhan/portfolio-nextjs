"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/components/ReusableComponent/ShowToast/ShowToast";

// Define the status type properly
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export type Order = {
  id: string; // Changed from 'id' to '_id' to match MongoDB
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  status: string;
  totalAmount: number;
  items: any[];
  employeeId: any;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
};

// Status badge component for better visual representation
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
    processing: { label: 'Processing', className: 'bg-orange-100 text-orange-800' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800' }, // This one
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  };

  // Use the status if it exists in config, otherwise use 'unknown'
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export const columns: ColumnDef<Order>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
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
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("customerName")}</div>,
  },
  {
    accessorKey: "customerAddress",
    header: "Customer Address",
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[300px]">
        {row.getValue("customerAddress") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "customerPhone",
    header: "Customer Phone",
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[200px]">
        {row.getValue("customerPhone") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "customerEmail",
    header: "Customer Email",
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[250px]">
        {row.getValue("customerEmail") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "notes",
    header: "Customer Notes",
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[200px]">
        {row.getValue("notes") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatus;
      return <StatusBadge status={status} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
  accessorKey: "totalAmount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const totalAmount = row.getValue("totalAmount");
      console.log('Total amount from row:', totalAmount);
      console.log('Full row data:', row.original);
      
      if (totalAmount === undefined || totalAmount === null) {
        return <div className="text-right font-medium">-</div>;
      }

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PKR",
      }).format(totalAmount as number);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString()} <br />
          <span className="text-gray-500">{date.toLocaleTimeString()}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;

      const [isDeleting, setIsDeleting] = useState(false);
      const router = useRouter();

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`/api/orders?id=${order.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            showToast('error', 'Failed to delete order');
            return;
          }

          router.refresh();
          showToast('success', 'Order deleted successfully');
        } catch (error) {
          showToast('error', 'Order cannot be deleted');
        } finally {
          setIsDeleting(false);
        }
      };

      return (
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
              <Link href={`/dashboard/orders/${order.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];