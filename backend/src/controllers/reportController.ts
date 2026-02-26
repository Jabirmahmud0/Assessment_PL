import { Request, Response } from 'express';
import Order from '../models/Order';

export const getSummary = async (req: Request, res: Response) => {
  try {
    const totalOrdersResult = await Order.countDocuments({ status: { $ne: 'cancelled' } });

    // Calculate revenue from both completed and pending orders (excluding cancelled)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'pending'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get top 3 products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 }
    ]);

    res.json({
      totalOrders: totalOrdersResult,
      totalRevenue: totalRevenue.toFixed(2),
      topProducts: topProducts || [],
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
