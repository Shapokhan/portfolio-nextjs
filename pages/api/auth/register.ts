import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/schemas/auth/registerSchema";
import bcrypt from "bcryptjs"; // for password hashing

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

  try {
    // Validate request body
    const parsedData = registerSchema.parse(req.body);
    const { name, email, password } = parsedData; // ignore passwordConfirm here

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      // Zod error
      return res.status(400).json(error);
    }
    return res.status(500).json({ message: "Something went wrong" });
  }
}
