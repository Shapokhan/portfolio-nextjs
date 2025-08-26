import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';

// ✅ POST - Create Product
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = (formData.get('description') as string) || '';
    const price = formData.get('price') as string;
    const file = formData.get('image') as File | null;

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Product Name and Price are required' },
        { status: 400 }
      );
    }

    let imageUrl = '';
    let imagePublicId = '';

    // ✅ Upload image if provided
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadedImage = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'products' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadedImage.secure_url;
      imagePublicId = uploadedImage.public_id;
    }

    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      imagePublicId,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

// ✅ GET (unchanged)
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
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// ✅ PUT - Update product with optional image handling
// ✅ PUT - Update product with optional image handling (replace/remove/keep)
export async function PUT(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const formData = await request.formData();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const name = formData.get('name') as string;
    const description =
      (formData.get('description') as string) || existingProduct.description;
    const price = formData.get('price') as string;
    const file = formData.get('image') as File | null;

    // 👇 Special field to explicitly remove image
    const removeImage = formData.get('removeImage') === 'true';

    let imageUrl = existingProduct.imageUrl;
    let imagePublicId = existingProduct.imagePublicId;

    // ✅ Case 1: Remove image
    if (removeImage) {
      if (existingProduct.imagePublicId) {
        await cloudinary.uploader.destroy(existingProduct.imagePublicId);
      }
      imageUrl = '';
      imagePublicId = '';
    }

    // ✅ Case 2: Replace image with new file
    else if (file) {
      if (existingProduct.imagePublicId) {
        await cloudinary.uploader.destroy(existingProduct.imagePublicId);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadedImage = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'products' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadedImage.secure_url;
      imagePublicId = uploadedImage.public_id;
    }

    // ✅ Case 3: Do nothing → keep old image (default fallthrough)

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          imagePublicId,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// ✅ DELETE (unchanged except cleanup Cloudinary)
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Valid product ID is required' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (deletedProduct.imagePublicId) {
      await cloudinary.uploader.destroy(deletedProduct.imagePublicId);
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
