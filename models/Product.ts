import { Schema, model, models, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  imageUrl: string;       // ✅ Store Cloudinary URL
  imagePublicId: string;  // ✅ Store Cloudinary public_id (for deletion)
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  imagePublicId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  minimize: false
});

productSchema.pre<IProduct>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Product: Model<IProduct> = models.Product || model<IProduct>('Product', productSchema);

export default Product;
