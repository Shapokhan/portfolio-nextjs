"use client";

import Link from "next/link";
import PfButton from "@/components/pf/pf-button";
import PfInputField from "@/components/pf/pf-input-field";
import PfTextarea from "@/components/pf/pf-textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormValues, productSchema } from "@/schemas/products/productSchema";

export default function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined, // Important for number validation
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="rounded-md border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <PfInputField
            register={register}
            errors={errors}
            name="name"
            placeholder="Enter product name"
            label="Product Name"
            required
          />
        </div>

        <div className="space-y-2">
          <PfTextarea
            register={register}
            errors={errors}
            name="description"
            placeholder="Enter product description"
            label="Description"
          />
        </div>

        <div className="space-y-2">
          <PfInputField
            register={register}
            errors={errors}
            name="price"
            type="number"
            step="1"
            min="1"
            placeholder="0.00"
            label="Price"
            required
          />
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Link href="/admin/dashboard/products">
            <PfButton variant="outline" type="button">
              Cancel
            </PfButton>
          </Link>
          <PfButton
            variant="default"
            type="submit"
          >
            Create Product
          </PfButton>
        </div>
      </form>
    </div>
  );
}