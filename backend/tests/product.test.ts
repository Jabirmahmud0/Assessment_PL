import request from 'supertest';
import app from '../src/server';
import './setup';
import User from '../src/models/User';
import Product from '../src/models/Product';

describe('Product Endpoints', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    // Create User
    await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });
    userToken = userLogin.body.token;
  });

  it('should get all products', async () => {
    await Product.create({ name: 'P1', description: 'D1', price: 10, stock: 5, category: 'Test', image: 'test.jpg' });
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.products.length).toEqual(1);
  });

  it('should allow admin to create product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New P', description: 'New D', price: 20, stock: 10, category: 'Test', image: 'test.jpg' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('New P');
  });

  it('should return 403 for regular user creating product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'New P', description: 'New D', price: 20, stock: 10, category: 'Test', image: 'test.jpg' });
    expect(res.statusCode).toEqual(403);
  });

  it('should return 401 for no token creating product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'New P', description: 'New D', price: 20, stock: 10, category: 'Test', image: 'test.jpg' });
    expect(res.statusCode).toEqual(401);
  });
});
