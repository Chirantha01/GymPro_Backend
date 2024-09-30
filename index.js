import express from "express";
import cors from "cors";
import {User} from './db.js';
import dotenv from 'dotenv';
import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

//init app
const app = express();

//middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

app.listen(PORT , ()=>{
    console.log(`Server is listening to the port ${PORT}`)
});

//Middleware for JWT Authentication
function generateAccessToken(user) {
    const payload = {
      id: user._id,
      email: user.email
    };
    
    const secret = JWT_SECRET;
    const options = { expiresIn: '1h' };
  
    return jwt.sign(payload, secret, options);
}

function verifyAccessToken(token) {
    const secret = JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secret);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.sendStatus(401);
    }
  
    const result = verifyAccessToken(token);
  
    if (!result.success) {
      return res.status(403).json({ error: result.error });
    }
  
    req.user = result.data;
    next();
}

app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the protected route!', user: req.user });
});

//token validation 
app.post('/validate', (req,res) =>{
    console.log("token validation started")
    const data = req.body;
    const token = data.token;
    console.log("Verifying token...");
    const validity = verifyAccessToken(token);
    console.log(validity);
    return res.json(validity);

})

//SIGN IN
app.post('/signin', async (req , res)=>{

    const {usernameOrEmail , password} = req.body;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);

    try{
        if(isEmail){
            const user1 = await User.findOne({email:usernameOrEmail});
            if (!user1){
                return res.status(400).json({message:"Email not found"});
            }
            const isPasswordValid = await bycrypt.compare(password , user1.password);

            if (!isPasswordValid){
                return res.status(400).json({message:"Password is wrong!"});
            }

            const token = generateAccessToken(user1);
            const userWithoutPassword = {...user1.toObject()};
            delete userWithoutPassword.password;

            return res.status(200).json({token:token,user:userWithoutPassword});
        }

        const user2 = await User.findOne({userName:usernameOrEmail});
            if (!user2){
                return res.status(400).json({message:"UserName not found"});
            }
            const isPasswordValid = await bycrypt.compare(password , user2.password);

            if (!isPasswordValid){
                return res.status(400).json({message:"Password is wrong!"});
            }

            const token = generateAccessToken(user2);
            const userWithoutPassword = {...user2.toObject()};
            delete userWithoutPassword.password;

            return res.status(200).json({token:token,user:userWithoutPassword});

        
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:"Internal Server Error"});
    }
});

//POST for sign-up
app.post('/signup' , async(req , res) => {
    try{
        const {username , email, password ,profilePicture ,  birthday , weight , height} = req.body;
        const hashedPassword = await bycrypt.hash(password , 10);

        const existingUser = await User.findOne({email:email});
        if (existingUser){
            return res.status(400).json({message:'User Already exist'});
        }
        const newUser = new User({
            userName:username,
            email:email,
            password:hashedPassword,
            profile_Photo:profilePicture,
            bDay:birthday,
            weight:weight,
            height:height
        });

        await newUser.save();
        const user = await User.findOne({email:email});
        const userWithoutPassword = {...user.toObject()};
        delete userWithoutPassword.password;
        const token = generateAccessToken(userWithoutPassword)

        res.status(201).json({message:"User signed up successfully!" ,token:token, user:userWithoutPassword});
    } catch(error){
        console.error("Signup error : " , error);
        res.status(500).json({message:"Server Error"});
    }
});