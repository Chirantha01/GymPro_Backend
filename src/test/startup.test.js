import request from 'supertest';
import { app } from '../app.js'; // Import your Express app
import { User } from '../db.js'; // Import the User model
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

let token1;

// Setup and teardown hooks
beforeAll(async () => {
    mongoose.connect(process.env.DB_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Create a test user
    const hashedPassword = await bcrypt.hash('starttest1234', 12);
    const user = new User({
        userName: 'starttestuser',
        email: 'starttestuser@example.com',
        password: hashedPassword,
    });
    await user.save();

    // Generate a token for the test user
    token1 = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
});

// Test suite for startup
describe('POST /startup', () => {
    test('should return token status true for a valid token', async () => {
        const response = await request(app)
            .post('/startup')
            .set('Authorization', `Bearer ${token1}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token_Status', true);
    });

    test('should return 400 if no token is provided', async () => {
        await User.deleteMany({});
        const response = await request(app)
            .post('/startup');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('token_Status', false);
    });

    test('should return 403 for an invalid token', async () => {
        const response = await request(app)
            .post('/startup')
            .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error');
    });
});
