import { Schema, model, models, Document, Model, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imagePublicId: string;
}

export interface IOrder extends Document {
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  items: IOrderItem[];
  employeeId: Types.ObjectId;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: 'Product' 
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  imagePublicId: { 
    type: String, 
    required: true 
  }
});

const orderSchema = new Schema<IOrder>({
  customerName: { 
    type: String, 
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerAddress: { 
    type: String, 
    required: [true, 'Customer address is required'],
    trim: true
  },
  customerPhone: { 
    type: String, 
    required: [true, 'Customer phone is required'],
    trim: true
  },
  customerEmail: { 
    type: String, 
    trim: true,
    lowercase: true
  },
  notes: { 
    type: String, 
    trim: true
  },
  items: [orderItemSchema],
  employeeId: { 
    type: Schema.Types.ObjectId, 
    required: [true, 'Employee ID is required'], 
    ref: 'User' 
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  minimize: false
});

// Update the updatedAt field before saving
orderSchema.pre<IOrder>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted order date
orderSchema.virtual('formattedOrderDate').get(function() {
  return this.orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted total amount
orderSchema.virtual('formattedTotalAmount').get(function() {
  return `$${this.totalAmount.toFixed(2)}`;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtual fields are serialized when converting to JSON
orderSchema.set('toJSON', { virtuals: true });

// Index for better query performance
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ employeeId: 1 });

const Order: Model<IOrder> = models.Order || model<IOrder>('Order', orderSchema);

export default Order;