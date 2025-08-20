// models/Product.ts
import { Schema, model, models, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  image: Buffer;   // <-- change from string to Buffer
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String },
  description: { type: String, default: '' },
  price: { type: Number },
  image: { type: Buffer },  // <-- updated to Buffer
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  minimize: false
});

// Add pre-save middleware to update timestamp
productSchema.pre<IProduct>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Product: Model<IProduct> = models.Product || model<IProduct>('Product', productSchema);

export default Product;
