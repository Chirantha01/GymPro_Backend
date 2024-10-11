import express from "express";
import {authenticateToken} from "../Middleware/Validate_Tokens.js";
import {User} from '../db.js';

const router = express.Router();

router.get('/workouts' , authenticateToken , async(req , res)=>{
    const user = req.user;
    const userEmail = user.email;

    try{
    const userToSend = await User.findOne({email:userEmail});
    const fetchedUser = {...userToSend.toObject()};
    userWithWorkouts = fetchedUser.workouts;
    return res.status(200).json(userWithWorkouts);
    }
    catch(error){
        console.error("Data Fetching error for Workout History screen" , error);
        res.status(400).json({message:"Workouts not found" , workouts:[]});
    }
});

router.post('/workouts' , authenticateToken , async(req , res)=>{
    const user = req.user;
    const userEmail = user.email;
    const workouts = req.body.workouts;

    try{
    const userToSend = await User.findOne({email:userEmail});
    const fetchedUser = {...userToSend.toObject()};
    userWithWorkouts = fetchedUser.workouts;
    return res.status(200).json(userWithWorkouts);
    }
    catch(error){
        console.error("Data Fetching error for Workout History screen" , error);
        res.status(400).json({message:"Workouts not found" , workouts:[]});
    }
});

export {router as workoutRouter};