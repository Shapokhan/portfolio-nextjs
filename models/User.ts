// models/User.ts
import { Schema, models, model } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = models.User || model('User', userSchema);
export default User;
