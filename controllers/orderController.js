import Order from "../models/Order.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
} from "../services/emailService.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    //  Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Unauthorized, token missing!" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized, invalid token!" });
    }

    const userId = decoded.id;
    const { items } = req.body;

    //  Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order!" });
    }


    const formattedItems = items.map((i) => ({
      productId: i._id || i.productId,
      name: i.name,
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 0,
      image: i.image,
    }));

    //  Calculate total
    const total = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    //  Validate total
    if (total <= 0) {
      return res.status(400).json({ message: "Invalid order total!" });
    }

    //  Create order
    const newOrder = new Order({
      user: userId,
      items: formattedItems,
      total,
    });

    await newOrder.save();

    // order confirmation email
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendOrderConfirmationEmail(newOrder, user);
        console.log(`Order confirmation email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Failed to create order!", error: err.message });
  }
};

// Get all orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Unauthorized, token missing!" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized, invalid token!" });
    }

    const userId = decoded.id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders!", error: err.message });
  }
};

// Get ALL orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // Build filter object
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get orders with user info populated
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

// // get single order by ID
// export const getOrderById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id).populate("user", "name email");
//     console.log(order);


//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found!"
//       })
//     }
//     res.status(200).json({
//       success: true,
//       order
//     })
//   } catch (error) {
//     console.error("Get order by ID error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch order",
//       error: error.message
//     })
//   }
// }

// Update order status (Admin only) - UPDATED WITH EMAIL
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, confirmed, shipped, delivered or cancelled"
      });
    }

    // get current order
    const currentOrder = await Order.findById(id).populate('user', 'name email');
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const oldStatus = currentOrder.status;

    // Find and update order
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    // send status update email
    if (oldStatus !== status && order.user && order.user.email) {
      try {
        await sendOrderStatusUpdateEmail(order, order.user, oldStatus, status);
        console.log(`Order status update email sent to ${order.user.email}`);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);

      }
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};

// Delete order (Admin only)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: err.message
    });
  }
};