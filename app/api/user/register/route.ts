import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { registerSchema } from "@/schemas/auth/registerSchema";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = registerSchema.parse(body);
    const { name, email, password, role, isActive = true } = parsedData;

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Before: ", parsedData);
    const user = new User({ name, email, password: hashedPassword, role, isActive });
    await user.save();

    console.log("User registered successfully", user);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Register API Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ message: "Validation error", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
