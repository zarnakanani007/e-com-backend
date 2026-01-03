import User from "../models/User.js";
import Product from '../models/Products.js'
import Order from '../models/Order.js'

// get admin
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // calc total revenue form del orders
        const revenueResult = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ])

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue
        })
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Error fetching admin statistics" })

    }
}