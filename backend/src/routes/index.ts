import { Router } from 'express';
import { register, login, googleLogin } from '../controllers/authController';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController';
import { getSummary } from '../controllers/reportController';
import { getUsers } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleLogin);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', authMiddleware, adminMiddleware, createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, deleteProduct);

// Cart
router.get('/cart', authMiddleware, getCart);
router.post('/cart', authMiddleware, addToCart);
router.delete('/cart/:productId', authMiddleware, removeFromCart);

// Orders
router.post('/orders', authMiddleware, createOrder);
router.get('/orders/my', authMiddleware, getMyOrders);
router.get('/orders', authMiddleware, adminMiddleware, getAllOrders);
router.put('/orders/:id', authMiddleware, adminMiddleware, updateOrderStatus);

// Reports
router.get('/reports/summary', authMiddleware, adminMiddleware, getSummary);

// Users
router.get('/users', authMiddleware, adminMiddleware, getUsers);

export default router;
