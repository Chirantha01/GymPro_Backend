import express from "express";
import {authenticateToken} from "../Middleware/Validate_Tokens.js";
import { body } from "express-validator";
import {validateRequest} from "../Middleware/Validate_Requests.js";
import {User} from "../db.js";

const router = express.Router();

router.post(
    "/changeUserInfo" , 
    [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Enter a Username!")
            .bail()
            .matches(/^\S+$/)
            .withMessage("Username should be in 1 word!")
            .bail()
            .custom((value) => {
                // Check if the value is not an email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(value)) {
                  throw new Error("Username cannot be an email address!");
                }
                return true;
            })
            .bail(),
        body("weight")
            .custom((value) => {
                
                if (value > 635) {
                throw new Error("Enter a valid weight!");
                }
                return true;
            })
            .bail(),
        body("height")
            .custom((value) => {
                    
                if (value > 275) {
                throw new Error("Enter a valid height!");
                }
                return true;
            })
    ],
    validateRequest,
    authenticateToken,
    async (req , res) => {
        console.log(req.body);
        

    try{
        const user = req.user; // Retrieved user from the custom validation
        const email = user.email;

        const {username , weight , height} = req.body;

        const existingUser = await User.findOne({userName:username});
        if (existingUser){
            throw new Error({message:"Username cannot be an email address!" , field:"username"});
        }

        await User.updateOne(
            {email:email},
            {
                $set:{'UserName':username , 'height':height , "weight":weight}
            }
        );

        return res.status(201).json({message:"User info updated successsfully!"})

    }
    catch(err){
        console.log("Error occured while updating info : " , err);
        res.status(500).json({error:"Error occured while updating info"});
    }
    }
);

export {router as changeUserInfoRouter};