import ProductForm from "@/components/admin/dashboard/products/product-form";

export default function NewProductPage() {
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">New Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}