import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from './src/app';  // Ensure this path is correct for your app
import bcrypt from 'bcryptjs';
import { User } from './src/db';  // Ensure this path is correct for your User model

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret';  // Use your JWT secret for testing
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// Global signin function to get the JWT token for authenticated requests
global.signin = async (usernameOrEmail, password) => {
  const response = await request(app)
    .post('/signin')  // Make sure this matches your sign-in route
    .send({ usernameOrEmail, password })
    .expect(200);  // Expect success

  const { token } = response.body;  // Get the token from the response body
  return token ? token : null;
};
