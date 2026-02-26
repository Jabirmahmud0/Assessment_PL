import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 12, sort, minPrice, maxPrice } = req.query;

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions: any = {};
    if (sort === 'Price Low-High') sortOptions.price = 1;
    else if (sort === 'Price High-Low') sortOptions.price = -1;
    else if (sort === 'Newest') sortOptions.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock } = req.body;

    // Validation
    if (!name || !description || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Please provide name, description, price and stock' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Price must be a number greater than or equal to 0' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a number greater than or equal to 0' });
    }

    const product = new Product({ name, description, price, stock });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price ?? product.price;
      product.stock = req.body.stock ?? product.stock;

      // Validation for updates
      if (product.price < 0) return res.status(400).json({ message: 'Price cannot be negative' });
      if (product.stock < 0) return res.status(400).json({ message: 'Stock cannot be negative' });

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
