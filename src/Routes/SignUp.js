import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import {validateRequest} from "../Middleware/Validate_Requests.js";
import bycrypt from 'bcryptjs';
import {User} from "../db.js";
import dotenv from 'dotenv';


dotenv.config();
const router = express.Router();

function generateAccessToken(user) {
    const payload = {
      id: user._id,
      email: user.email
    };
    
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' };
  
    return jwt.sign(payload, secret, options);
}

router.post(
    "/signup" , 
    [
        body("email").isEmail().withMessage("E mail must be valid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Enter a password!")
            .bail()
            .matches(/^\S+$/)
            .withMessage("Password cannot contain any spaces!")
            .isLength({min:4 , max:20})
            .withMessage("Password must be between 4 to 20 characters")
            .bail()
            .matches(/\d/)
            .withMessage("Password must contain at least one number!")
            .bail()
            .matches(/[A-Z]/)
            .withMessage("Password must contain at least one uppercase letter!")
            .bail()
            .matches(/[a-z]/)
            .withMessage("Password must contain at least one lowercase letter!")
            .bail()
            .matches(/[!@#$%^&*]/)
            .withMessage("Password must contain at least one special character!")
            .bail(),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Enter a Username!")
            .bail()
            .custom((value) => {
                // Check if the value is not an email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(value)) {
                  throw new Error("Username cannot be an email address!");
                }
                return true;
            })
            .matches(/^\S+$/)
            .withMessage("Username should be in 1 word!")
    ],
    validateRequest,
    async (req , res) => {
        try{
            const {username , email, password ,profilePicture ,  birthday , weight , height} = req.body;
            const hashedPassword = await bycrypt.hash(password , 10);
    
            const existingUser1 = await User.findOne({email:email});
            const existingUser2 = await User.findOne({userName:username});
            if (existingUser1){
                return res.status(400).json({usernameMessage:'User Already exist' , success:false});
            }
            if (existingUser2){
                return res.status(400).json({usernameMessage:'User Already exist' , success:false});
            }
            
            const newUser = new User({
                userName:username,
                email:email,
                password:hashedPassword,
                profile_Photo:profilePicture,
                bDay:birthday,
                weight:weight,
                height:height,
                otp:"",
                otpExpires:""
            });
    
            await newUser.save();
            const user = await User.findOne({email:email});
            const userWithoutPassword = {...user.toObject()};
            delete userWithoutPassword.password;
            const token = generateAccessToken(userWithoutPassword)
    
            res.status(201).json({message:"User signed up successfully!" ,token:token, user:userWithoutPassword , success:true});
        } catch(error){
            console.error("Signup error : " , error);
            res.status(500).json({message:"Server Error" , success:false});
        }
    }
);

export {router as signupRouter};