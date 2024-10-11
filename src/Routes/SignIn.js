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
    "/signin" , 
    [
        body("password")
            .trim()
            .matches(/^\S+$/)
            .withMessage("Password cannot contain any spaces!")
            .isLength({min:4 , max:20})
            .withMessage("Password must be between 4 to 20 characters"),
        body("usernameOrEmail")
            .trim()
            .notEmpty()
            .withMessage("Enter a Username!")
            .matches(/^\S+$/)
            .withMessage("Username should be in 1 word!")
    ],
    validateRequest,
    async (req , res) => {
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
    }
);

export {router as signinRouter};