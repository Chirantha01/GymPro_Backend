import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../app.js'; 
import { User } from '../db.js'; 
import mongoose from 'mongoose';

beforeAll(async () => {
    mongoose.connect(process.env.DB_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log("MongoDB is connected"))
        .catch((err) => console.log("Error connecting to MongoDB: ", err));
});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
});

describe('POST /signup', () => {
    test('should sign up a new user successfully', async () => {
        const response = await request(app)
            .post('/signup')
            .send({
                username: 'mockuser',
                email: 'mockuser@example.com',
                password: 'newpassword123',
                profilePicture: 'http://example.com/profile.jpg',
                birthday: '1990-01-01',
                weight: 70,
                height: 175
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("User signed up successfully!");
    });

    test('should fail if the email is already taken', async () => {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const existingUser = new User({
            userName: 'existinguser',
            email: 'existinguser@example.com',
            password: hashedPassword,
        });
        await existingUser.save();

        const response = await request(app)
            .post('/signup')
            .send({
                username: 'newuser2',
                email: 'existinguser@example.com', // same email
                password: 'newpassword123'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('usernameMessage', 'User Already exist');
        expect(response.body.success).toBe(false);
    });

    test('should fail if the username is already taken', async () => {
        await User.deleteMany({});
        const hashedPassword = await bcrypt.hash('testpassword1234', 10);
        const existingUser = new User({
            userName: 'existinguser',
            email: 'takenusername@example.com',
            password: hashedPassword,
        });
        await existingUser.save();

        const response = await request(app)
            .post('/signup')
            .send({
                username: 'takenusername', // same username
                email: 'takenusername@example.com',
                password: 'newpassword123'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('usernameMessage', 'User Already exist');
        expect(response.body.success).toBe(false);
    });

    test('should fail if the email is invalid', async () => {
        const response = await request(app)
            .post('/signup')
            .send({
                username: 'invalidemailuser',
                email: 'invalid-email', // invalid email
                password: 'newpassword123'
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].message).toBe("E mail must be valid");
    });

    test('should fail if the password is too short', async () => {
        const response = await request(app)
            .post('/signup')
            .send({
                username: 'shortpassworduser',
                email: 'shortpassword@example.com',
                password: '123' // too short
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].message).toBe("Password must be between 4 to 20 characters");
    });
});
