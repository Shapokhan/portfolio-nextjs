// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";


// GET - Fetch all orders with pagination, filtering, and sorting
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const customer = searchParams.get("customer");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = {};

    if (status) {
      searchQuery.status = status;
    }

    if (customer) {
      searchQuery.$or = [
        { customerName: { $regex: customer, $options: "i" } },
        { customerEmail: { $regex: customer, $options: "i" } },
        { customerPhone: { $regex: customer, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) {
        searchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        searchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    // Determine sort order
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Fetch orders with population
    const orders = await Order.find(searchQuery)
      .populate("employeeId", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(searchQuery);

    console.log("From API: ",orders);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  let body;
  try {
    await connectToDatabase();

    // Parse the request body first
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.customerName || !body.customerAddress || !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: "Missing required customer information" },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!body.employeeId) {
      return NextResponse.json(
        { success: false, error: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Validate each order item
    for (const [index, item] of body.items.entries()) {
      if (!item.productId) {
        return NextResponse.json(
          { success: false, error: `Item ${index + 1}: Product ID is required` },
          { status: 400 }
        );
      }
      
      if (!item.name) {
        return NextResponse.json(
          { success: false, error: `Item ${index + 1}: Product name is required` },
          { status: 400 }
        );
      }
      
      if (!item.price && item.price !== 0) {
        return NextResponse.json(
          { success: false, error: `Item ${index + 1}: Price is required` },
          { status: 400 }
        );
      }
      
      if (!item.quantity) {
        return NextResponse.json(
          { success: false, error: `Item ${index + 1}: Quantity is required` },
          { status: 400 }
        );
      }
      
      // Make imagePublicId optional or provide default if not required
      if (!item.imagePublicId) {
        item.imagePublicId = ""; // Or handle as needed
      }
      
      if (!item.imageUrl) {
        item.imageUrl = ""; // Provide default empty string if not required
      }
    }

    // Check stock availability and validate products
    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.name} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${item.name}. Only ${product.stock} available.`,
          },
          { status: 400 }
        );
      }
    }

    // Update product stock quantities
    for (const item of body.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Create new order
    const order = new Order({
      ...body,
      orderDate: body.orderDate || new Date(),
    });

    await order.save();

    // Populate employee information
    await order.populate("employeeId", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);

    // Revert stock changes if order creation failed
    if (body?.items) {
      for (const item of body.items) {
        try {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
        } catch (rollbackError) {
          console.error("Error rolling back stock changes:", rollbackError);
        }
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create order",
        details: error.errors || {}
      },
      { status: 500 }
    );
  }
}

// PUT - Update an existing order
export async function PUT(request: NextRequest) {
  let body;
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find existing order
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Handle stock adjustments if items are being modified
    if (body.items && JSON.stringify(body.items) !== JSON.stringify(existingOrder.items)) {
      // Revert old stock quantities
      for (const item of existingOrder.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }

      // Check new stock availability
      for (const item of body.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return NextResponse.json(
            { success: false, error: `Product ${item.name} not found` },
            { status: 400 }
          );
        }

        if (product.stock < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for ${item.name}. Only ${product.stock} available.`,
            },
            { status: 400 }
          );
        }
      }

      // Apply new stock quantities
      for (const item of body.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("employeeId", "name email");

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to update order",
        details: error.errors || {}
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete an order
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find order first to restore stock
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // Delete order
    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}