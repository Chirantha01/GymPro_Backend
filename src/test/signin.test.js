import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../app.js'; 
import { User } from '../db.js'; 
import mongoose from 'mongoose';

beforeAll(async () => {
    mongoose.connect(process.env.DB_ATLAS_URI , {
        UseNewUrlParser : true,
        useUnifiedTopology : true,
    })
        .then(() => console.log("MongoDB is connected"))
        .catch((err) => console.log("Error connecting to MongoDB : ", err));
    // Create a test user in the database
    const hashedPassword = await bcrypt.hash('test1234', 12);
    const user =  new User({
        userName: 'testsignuser',
        email: 'testsignuser@example.com',
        password: hashedPassword,
    });
    await user.save();

});

afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    console.log("mongoDB disconnnected");
    // Clean up the database after tests
    // await User.deleteMany({});
});

describe('POST /signin', () => {
  test('should sign in with correct email and password', async () => {
    const response = await request(app)
      .post('/signin')
      .send({
        usernameOrEmail: 'testsignuser@example.com',
        password: 'test1234'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.success).toBe(true);
  });

  test('should sign in with correct username and password', async () => {
    const hashedPassword = await bcrypt.hash('testpassword', 10);
        const existingUser = new User({
            userName: 'correctusername',
            email: 'correctusername@example.com',
            password: hashedPassword,
        });
        await existingUser.save();

    const response = await request(app)
      .post('/signin')
      .send({
        usernameOrEmail: 'correctusername',
        password: 'testpassword'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.success).toBe(true);
  });

  test('should fail if email is incorrect', async () => {
    const response = await request(app)
      .post('/signin')
      .send({
        usernameOrEmail: 'wrongemail@example.com',
        password: 'test1234'
      });

    expect(response.status).toBe(400); // Assuming you return 400 for validation errors
    expect(response.body).toHaveProperty('errors');
  });

  test('should fail if password is incorrect', async () => {
    const response = await request(app)
      .post('/signin')
      .send({
        usernameOrEmail: 'testuser',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(400); // Assuming you return 400 for validation errors
    expect(response.body).toHaveProperty('errors');
  });
});

// test('always passing test', () => {
//     expect(true).toBe(true);
//   });
