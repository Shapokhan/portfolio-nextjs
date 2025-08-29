import { Separator } from '@/components/ui/separator';
import PfButton from '@/components/pf/pf-button';
import Image from 'next/image';

interface ProductDetailProps {
  onClose: () => void;
  product: any;
}
const ProductDetail: React.FC<ProductDetailProps> = ({ onClose, product }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Image Section */}
        <div className="w-full flex justify-center items-center bg-slate-100">
          <div className="lg:h-[408px] md:h-[408px] h-[190px] lg:w-full md:[w-full] rounded-sm relative">
            <Image
              src={product.imageUrl}
              alt={product.imageUrl}
              fill
              style={{ objectFit: "cover" }}
              className="object-contain rounded"
              priority
            />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <h1 className="text-lg text-slate-900 mb-2">Name: {product.name}</h1>

          <p className="text-lgtext-slate-900 mb-1">Price : {product.price}</p>

          <Separator className="my-2 bg-slate-200" />
          <p className="text-base text-slate-900 mb-6">
            {product.description}
          </p>
          <PfButton variant="default" type="button" onClick={onClose}>
            Close
          </PfButton>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
