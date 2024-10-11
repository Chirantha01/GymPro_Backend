import express from "express";
import {authenticateToken} from "../Middleware/Validate_Tokens.js";
import {User} from '../db.js';

const router = express.Router();

router.get('/home' , authenticateToken , async(req , res)=>{
    const user = req.user;
    const userEmail = user.email;

    try{
    const userToSend = await User.findOne({email:userEmail});
    const userWithoutPassword = {...userToSend.toObject()};
    delete userWithoutPassword.password;
    return res.status(200).json(userWithoutPassword);
    }
    catch(error){
        console.error("Data Fetching error for home screen" , error);
        res.status(400).json({message:"User Not Found"});
    }
});

export {router as homeRouter};