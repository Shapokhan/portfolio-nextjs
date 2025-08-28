import { Button } from "@/components/ui/button";
import { Order, columns } from "./columns";
import { DataTable } from "./data-table";
import Link from "next/link";
import { Plus } from "lucide-react";

const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error('Failed to fetch orders');
    }

    const result = await response.json();
    
    // Check if response is paginated (has data property) or direct array
    const orders = result.data || result;
    
    return orders.map((order: any) => ({
      id: order._id?.toString() || order.id,
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail || '',
      notes: order.notes,
      totalAmount: order.totalAmount || 0,
      items: order.items || [],
      status: order.status,
      employeeId: order.employeeId,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
};

const OrderPage = async () => {
  const data = await fetchOrders();

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">All Orders</h1>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/dashboard/orders/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
        
        {data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No orders found. Create your first order!
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/orders/new">
                Create Order
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;