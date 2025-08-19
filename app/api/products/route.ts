import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate the data (optional - since you're already validating on client)
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = await Product.create({
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
    });

    return NextResponse.json(newProduct, { status: 201 });
    
  } catch (error: any) {
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

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        $set: {
          name: body.name,
          description: body.description,
          price: body.price,
          updatedAt: new Date()
        }
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