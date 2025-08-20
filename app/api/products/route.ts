import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    if (!body.name || !body.price || !body.image) {
      return NextResponse.json(
        { error: "Name, price, and image are required" },
        { status: 400 }
      );
    }

    // ✅ Ensure we are actually sending a Buffer, not a string
    let imageBuffer: Buffer | undefined;
    if (typeof body.image === "string" && body.image.startsWith("data:image")) {
      const base64Data = body.image.split(",")[1];
      imageBuffer = Buffer.from(base64Data, "base64");
    }

    const newProduct = await Product.create({
      name: body.name,
      description: body.description || "",
      price: parseFloat(body.price),
      image: imageBuffer, // ✅ this is a Buffer, not a string
    });

    // Convert buffer back to base64 for response
    const productObj = newProduct.toObject();
    if (newProduct.image) {
      productObj.image = `data:image/png;base64,${newProduct.image.toString("base64")}`;
    }

    return NextResponse.json(productObj, { status: 201 });
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

    const searchQuery = search 
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const products = await Product.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(searchQuery);

    // Convert buffers to base64 before sending
    const productsWithImages = products.map(p => {
      const obj = p.toObject();
      if (obj.image) {
        obj.image = `data:image/png;base64,${p.image.toString("base64")}`;
      }
      return obj;
    });

    return NextResponse.json({
      data: productsWithImages,
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

    const updateData: any = {
      name: body.name,
      description: body.description,
      price: body.price,
      updatedAt: new Date()
    };

    if (body.image) {
      const base64Data = body.image.split(',')[1];
      updateData.image = Buffer.from(base64Data, "base64");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const obj = updatedProduct.toObject();
    if (obj.image) {
      obj.image = `data:image/png;base64,${updatedProduct.image.toString("base64")}`;
    }

    return NextResponse.json(obj);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
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
