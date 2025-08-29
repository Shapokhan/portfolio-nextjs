import OrderForm from '@/components/admin/dashboard/orders/order-form';
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import { notFound } from 'next/navigation';

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function EditOrderPage({
  params,
}: PageProps) {
  const { orderId } = await params;
  
  if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
    return notFound();
  }

  try {
    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return notFound();
    }

    // Manually convert to plain object
    const plainOrder = JSON.parse(JSON.stringify(order));
    
    // Ensure ObjectIds are converted to strings
    plainOrder._id = plainOrder._id.toString();
    plainOrder.employeeId = plainOrder.employeeId.toString();
    
    // Convert items' ObjectIds to strings
    plainOrder.items = plainOrder.items.map((item: any) => ({
      ...item,
      productId: item.productId.toString(),
      _id: item._id?.toString?.(),
    }));

    return (
      <div className="">
        <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">Edit Order</h1>
        </div>
        <OrderForm 
          initialData={{
            id: plainOrder._id,
            customerName: plainOrder.customerName,
            customerAddress: plainOrder.customerAddress,
            customerPhone: plainOrder.customerPhone,
            customerEmail: plainOrder.customerEmail || '',
            notes: plainOrder.notes || '',
            items: plainOrder.items,
            employeeId: plainOrder.employeeId,
            totalAmount: plainOrder.totalAmount,
            status: plainOrder.status
          }} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching order:', error);
    return notFound();
  }
}