import request from 'supertest';
import { app } from '../app.js'; // Import your Express app
import { User } from '../db.js'; // Import the User model
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

let token;

// Setup and teardown hooks
beforeAll(async () => {
    mongoose.connect(process.env.DB_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // Create a test user
    const hashedPassword = await bcrypt.hash('test1234', 12);
    const user = new User({
        userName: 'testuser',
        email: 'testuser@example.com',
        password: hashedPassword,
        workouts: [], // Initialize workouts as empty
    });
    await user.save();

    // Generate a token for the test user
    token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
});

// Test suite for workouts
describe('Workouts API', () => {
    describe('GET /workouts', () => {
        test('should return workouts for a valid token', async () => {
            const response = await request(app)
                .get('/workouts')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array); // Assuming workouts is an array
        });

        test('should return 400 if no token is provided', async () => {
            const response = await request(app).get('/workouts');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('token_Status', false);
        });

        test('should return 403 for an invalid token', async () => {
            const response = await request(app)
                .get('/workouts')
                .set('Authorization', 'Bearer invalidtoken');

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error');
        });
    });
    
    

    describe('POST /workouts', () => {
        test('should add a new workout for a valid token', async () => {
            const hashedPassword = await bcrypt.hash('test1234', 12);
            const userx = new User({
                userName: 'testuser',
                email: 'testuser@example.com',
                password: hashedPassword,
                workouts: [], // Initialize workouts as empty
            });
            await userx.save();

            // Generate a token for the test user
            token = jwt.sign({ id: userx._id, email: userx.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const newWorkout = {
                workouts: [{
                    date: '2024-10-15T00:00:00Z',
                    last_modified: new Date().toISOString(),
                    e_name: 'Push-up',
                    time: 30,
                    reps: 10,
                    accuracy: 95,
                }],
            };

            const response = await request(app)
                .post('/workouts')
                .set('Authorization', `Bearer ${token}`)
                .send(newWorkout);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('workouts');
            expect(response.body.workouts).toBeInstanceOf(Array);
            expect(response.body.workouts.length).toBeGreaterThan(0);
        });


        test('should return 403 for an invalid token', async () => {
            const response = await request(app)
                .post('/workouts')
                .set('Authorization', 'Bearer invalidtoken')
                .send({
                    workouts: [{
                        date: '2024-10-15T00:00:00Z',
                        last_modified: new Date().toISOString(),
                        e_name: 'Push-up',
                        time: 30,
                        reps: 10,
                        accuracy: 95,
                    }],
                });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error');
        });
    });
});
