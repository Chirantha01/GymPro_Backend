import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import {validateRequest} from "../Middleware/Validate_Requests.js";
import bcrypt from 'bcryptjs';
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
        body("usernameOrEmail")
            .trim()
            .notEmpty()
            .withMessage("Enter a Username!")
            .bail()
            .matches(/^\S+$/)
            .withMessage("Username should be in 1 word!")
            .bail()
            .custom(async (value, { req }) => {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

                let user;
                if (isEmail) {
                    user = await User.findOne({ email: value });
                    if (!user) {
                        throw new Error("Email not found");
                    }
                } else {
                    user = await User.findOne({ userName: value });
                    if (!user) {
                        throw new Error("Username not found");
                    }
                }

                // Attach the user to the request object for later use in password validation
                req.user = user;

                return true;
            })
            .bail(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Enter a password!")
            .bail()
            .matches(/^\S+$/)
            .withMessage("Password cannot contain any spaces!")
            .isLength({min:4 , max:20})
            .withMessage("Password must be between 4 to 20 characters")
            .custom(async (password, { req }) => {
                const user = req.user;
                if(!user){
                    return true;
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Password is wrong!");
                }
                return true;
            })
        
    ],
    validateRequest,
    async (req , res) => {
        console.log(req.body);
        

    try{
        const user = req.user; // Retrieved user from the custom validation
        const token = generateAccessToken(user);

        const userWithoutPassword = { ...user.toObject() };
        delete userWithoutPassword.password;

        return res.status(200).json({token:token,user:userWithoutPassword , success:true});
    }
    catch(err){
        console.error("sign in error : " , err);
        res.status(500).json({error:"Internal Server Error"});
    }
    }
);

export {router as signinRouter};