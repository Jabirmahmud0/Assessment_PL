import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id }).populate('items.product');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: 'Quantity exceeds stock' });
    }

    let cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      cart = new Cart({ user: req.user?.id, items: [{ product: productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
      if (itemIndex > -1) {
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
          return res.status(400).json({ message: 'Total quantity exceeds stock' });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id });
    if (cart) {
      cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId) as any;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
