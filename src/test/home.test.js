import request from 'supertest';
import { app } from '../app.js'; 
import { User } from '../db.js'; 
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

let token;

beforeAll(async () => {
    mongoose.connect(process.env.DB_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Create a test user in the database
    const hashedPassword = await bcrypt.hash('test1234', 12);
    const user = new User({
        userName: 'testhomeuser',
        email: 'testhomeuser@example.com',
        password: hashedPassword,
    });
    await user.save();

    // Generate a token for the test user
    token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
});

describe('GET /home', () => {
    test('should return username for a valid token', async () => {
        const response = await request(app)
            .get('/home')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('userName', 'testhomeuser');
    });

    test('should return 403 for an invalid token', async () => {
        const response = await request(app)
            .get('/home')
            .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error');
    });

    test('should return 400 if no token is provided', async () => {
        const response = await request(app)
            .get('/home');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('token_Status', false);
    });

    test('should return 401 if user is not found', async () => {
        // Create a new token for a non-existent user
        const nonExistentUserToken = jwt.sign({ id: 'nonExistenthomeUserId', email: 'nonexistenthome@example.com' }, process.env.JWT_SECRET);

        const response = await request(app)
            .get('/home')
            .set('Authorization', `Bearer ${nonExistentUserToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'User Not Found');
    });
});
