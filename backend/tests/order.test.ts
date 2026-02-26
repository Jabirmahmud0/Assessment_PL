import request from 'supertest';
import app from '../src/server';
import './setup';
import Product from '../src/models/Product';

describe('Order and Stock Endpoints', () => {
  let token: string;
  let productId: string;

  beforeEach(async () => {
    const authRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    token = authRes.body.token;

    const product = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      category: 'Test',
      image: 'test.jpg'
    });
    productId = product._id.toString();
  });

  it('should place an order and deduct stock', async () => {
    // Add to cart
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 });

    // Place order
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(201);

    const updatedProduct = await Product.findById(productId);
    expect(updatedProduct?.stock).toEqual(8);
  });

  it('should fail order if insufficient stock', async () => {
    // Add to cart more than stock
    // Note: Cart controller checks stock on add, but let's simulate a race condition or direct order if possible
    // For this test, we'll add 5, then manually reduce stock to 2, then try to order
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 5 });

    await Product.findByIdAndUpdate(productId, { stock: 2 });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Insufficient stock');
  });
});
