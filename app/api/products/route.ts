import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate
    if (!body.name || !body.price || !body.image) {
      return NextResponse.json(
        { error: "Name, price, and image are required" },
        { status: 400 }
      );
    }

    // Convert Base64 string to Buffer
    const imageBuffer = Buffer.from(body.image, "base64");

    console.log(imageBuffer);

    const newProduct = await Product.create({
      name: body.name,
      description: body.description || "",
      price: parseFloat(body.price),
      image: imageBuffer, // 👈 save as Buffer
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Build the search query
    const searchQuery = search 
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // Get products with pagination
    const products = await Product.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Product.countDocuments(searchQuery);

    return NextResponse.json({
      data: products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// For PUT (update) requests
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate image if provided
    if (body.image && !isValidBase64Image(body.image)) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name: body.name,
      description: body.description,
      price: body.price,
      updatedAt: new Date()
    };

    // Only update image if it's provided
    if (body.image !== undefined) {
      updateData.image = body.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        $set: updateData
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Valid product ID is required" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

// Helper function to validate base64 image format
// Helper function to validate base64 image format
function isValidBase64Image(image: string): boolean {
  if (!image || image === '' || image === null) return true; // Allow empty values
  
  // First, check if it's a valid data URL format
  const dataUrlRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  if (!dataUrlRegex.test(image)) {
    console.log('Invalid data URL format:', image.substring(0, 100));
    return false;
  }

  try {
    // Extract the base64 part
    const base64Data = image.split(',')[1];
    if (!base64Data) {
      console.log('No base64 data found after comma');
      return false;
    }
    
    // Basic base64 validation - check if it contains only valid characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64Data)) {
      console.log('Invalid base64 characters');
      return false;
    }
    
    // Try to decode to see if it's valid base64
    const decoded = Buffer.from(base64Data, 'base64');
    
    // For images, we should get some data back
    if (decoded.length === 0) {
      console.log('Decoded data is empty');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('Base64 decoding error:', error);
    return false;
  }
}