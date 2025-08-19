import { Schema, model, models, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product: Model<IProduct> = models.Product || model<IProduct>('Product', productSchema);

export default Product;
