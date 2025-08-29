import PfButton from '@/components/pf/pf-button';

interface ProductDeleteProps {
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ProductDelete: React.FC<ProductDeleteProps> = ({ onClose, onDelete, isDeleting }) => {
  return (
    <div className="p-2">
      <p className="text-slate-800 mb-5 text-bold text-[20px]">
        Are you sure you want to delete this product? 
      </p>
      <div className="flex justify-end gap-4">
        <PfButton variant="default" type="button" onClick={onClose}>
          Cancel
        </PfButton>
        <PfButton
          variant="destructive"
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </PfButton>
      </div>
    </div>
  );
};

export default ProductDelete;
