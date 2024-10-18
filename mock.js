process.env.NODE_ENV = 'test';

import { expect , use} from 'chai';
import chaiHttp from 'chai-http';
import {app} from '../app.js'; 
import { User } from '../db.js'; 
import bcrypt from 'bcryptjs';

const chai = use(chaiHttp);

describe('POST /signin', () => {
    let user;
  
    before(async function () {
      this.timeout(10000); 
      console.log('Setting up test user...');
      const hashedPassword = await bcrypt.hash('test1234', 12);
      user = new User({
        userName: 'testuser',
        email: 'testuser@example.com',
        password: hashedPassword,
      });
  
      await user.save();
      console.log('Test user created successfully.');
    });
  
    after(async function () {
      console.log('Cleaning up test database...');
      await User.deleteMany({});
      console.log('Test database cleaned up.');
    });
  
    it('should sign in with correct email and password', (done) => {
      chai.request(app)
        .post('/signin')
        .send({
          usernameOrEmail: 'testuser@example.com',
          password: 'test1234'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          expect(res.body.success).to.equal(true);
          done();
        });
    });
  
    it('should sign in with correct username and password', (done) => {
      chai.request(app)
        .post('/signin')
        .send({
          usernameOrEmail: 'testuser',
          password: 'test1234'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          expect(res.body.success).to.equal(true);
          done();
        });
    });
  
    it('should fail if email is incorrect', (done) => {
      chai.request(app)
        .post('/signin')
        .send({
          usernameOrEmail: 'wrongemail@example.com',
          password: 'test1234'
        })
        .end((err, res) => {
          expect(res).to.have.status(400); // Assuming you return 400 for validation errors
          expect(res.body).to.have.property('errors');
          done();
        });
    });
  
    it('should fail if password is incorrect', (done) => {
      chai.request(app)
        .post('/signin')
        .send({
          usernameOrEmail: 'testuser',
          password: 'wrongpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(400); // Assuming you return 400 for validation errors
          expect(res.body).to.have.property('errors');
          done();
        });
    });
  });
