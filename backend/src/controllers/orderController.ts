import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: req.user?.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      if (!item.product) continue; // Skip ghost products that were deleted

      const product = await Product.findById(item.product._id).session(session);
      if (!product) {
        throw new Error(`Product ${item.product._id} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ session });

      // Prepare order item snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    if (orderItems.length === 0) {
      throw new Error('Your cart items are no longer available.');
    }

    const order = new Order({
      user: req.user?.id,
      items: orderItems,
      totalAmount,
      status: 'pending',
    });

    const createdOrder = await order.save({ session });

    // Clear cart
    await Cart.deleteOne({ user: req.user?.id }).session(session);

    await session.commitTransaction();
    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: (error as Error).message });
  } finally {
    session.endSession();
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
