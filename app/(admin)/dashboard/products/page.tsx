import { Button } from "@/components/ui/button";
import { Product,columns } from "./columns";
import { DataTable } from "./data-table";
import Link from "next/link";
import { Plus } from "lucide-react";

const getData = async (): Promise<Product[]> => {
  return [
    {
      id: "728ed521",
      name: "Cart Plus",
      price: 1500,
      description: "Used for joints pain",
    },
    {
      id: "728ed522",
      name: "Cart Plus 2",
      price: 1500,
      description: "Used for joints pain",
    }
  ];
};

const ProductPage = async () => {
  const data = await getData();
  return (
    <div className="space-y-6">
      {/* First row - All Products title */}
      <div className="w-full">
        <div className="px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">All Products</h1>
        </div>
      </div>

      {/* Second row - DataTable and New Product button */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/dashboard/products/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </Button>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default ProductPage;