// models/User.ts
import { Schema, models, model, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee' | 'user'; // Added role to distinguish between users and employees
  isActive: boolean; // To manage user/employee status
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        enum: ['admin', 'employee', 'user'], 
        default: 'admin' 
      },
    isActive: { type: Boolean, default: true }
  }, 
  {
    timestamps: true // This automatically adds createdAt and updatedAt fields
  }
);


const User: Model<IUser> = models.User || model<IUser>('User', userSchema);

export default User;

