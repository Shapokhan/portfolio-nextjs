import { Button } from "@/components/ui/button";
import { Product, columns } from "./columns";
import { DataTable } from "./data-table";
import Link from "next/link";
import { Plus } from "lucide-react";

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/products`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error('Failed to fetch products');
    }

    const result = await response.json();
    
    // Check if response is paginated (has data property) or direct array
    const products = result.data || result;
    
    return products.map((product: any) => ({
      id: product._id?.toString() || product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      createdAt: product.createdAt
    }));
  } catch (error) {
    console.error('Fetch Error:', error);
    return [];
  }
};

const ProductPage = async () => {
  const data = await fetchProducts();

  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">All Products</h1>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/dashboard/products/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </Button>
        </div>
        
        {data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No products found. Create your first product!
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/products/new">
                Create Product
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;