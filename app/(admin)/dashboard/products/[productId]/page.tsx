import ProductForm from '@/components/admin/dashboard/products/product-form';
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Product";
import { notFound } from 'next/navigation';

export const dynamicParams = true; // Enable dynamic params

interface PageProps {
  params: Promise<{ productId: string }>; // params is now a Promise
}

export default async function EditProductPage({
  params,
}: PageProps) {
  // Await params before accessing its properties
  const { productId } = await params;
  
  // Validate productId format first
  if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
    return notFound();
  }

  try {
    await connectToDatabase();
    const product = await Product.findById(productId).lean();

    if (!product) {
      return notFound();
    }

    return (
      <div className="">
        <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
          <h1 className="font-semibold">Edit Product {JSON.stringify(product.imageUrl)}</h1>
        </div>
        <ProductForm 
          initialData={{
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl
          }} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return notFound();
  }
}