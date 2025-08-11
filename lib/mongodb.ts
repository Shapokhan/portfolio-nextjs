import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDatabase = async (): Promise<void> => {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    throw new Error('Failed to connect to MongoDB');
  }
};
