import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.name || !body.price || !body.imageUrl) {
      return NextResponse.json(
        { error: 'Name, price, and imageUrl are required' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ At this point, body.image should already be a Cloudinary URL (not base64)
    if (!body.imageUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newProduct = await Product.create({
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      imageUrl: body.imageUrl, // ✅ Just save URL
      imagePublicId: body.imagePublicId,
    });

    console.log(body);

    return NextResponse.json(newProduct, {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
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
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Fetch products (image is now just a Cloudinary URL string)
    const products = await Product.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(searchQuery);
    return NextResponse.json({
      data: products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
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
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // ✅ If image is updated, remove old one
    if (
      body.imagePublicId &&
      body.imagePublicId !== existingProduct.imagePublicId
    ) {
      await cloudinary.uploader.destroy(existingProduct.imagePublicId);
    }

    const updateData: any = {
      name: body.name,
      description: body.description,
      price: body.price,
      updatedAt: new Date(),
      imageUrl: body.imageUrl || existingProduct.imageUrl,
      imagePublicId: body.imagePublicId || existingProduct.imagePublicId,
    };

    // ✅ Only update Cloudinary URL if provided
    if (body.image) {
      updateData.image = body.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
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
        { error: 'Valid product ID is required' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (deletedProduct.imagePublicId) {
      await cloudinary.uploader.destroy(deletedProduct.imagePublicId);
    }

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
