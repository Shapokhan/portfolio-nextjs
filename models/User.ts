// models/User.ts
import { Schema, models, model, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// 👇 Explicitly type your model
const User: Model<IUser> = models.User || model<IUser>('User', userSchema);

export default User;

