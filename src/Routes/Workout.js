import express from "express";
import {authenticateToken} from "../Middleware/Validate_Tokens.js";
import {User} from '../db.js';

const router = express.Router();

function convertToUTC530(isoDateString) {
    const date = new Date(isoDateString);

    // Calculate offset for UTC+05:30 (5.5 hours or 330 minutes)
    const offsetInMinutes = 330; // 5 hours 30 minutes

    // Adjust the date by the offset in minutes
    const utc530Date = new Date(date.getTime() + offsetInMinutes * 60000);

    return utc530Date.toISOString().replace('T', ' ').substr(0, 19); // Format the date and time
}

router.get('/workouts' , authenticateToken , async(req , res)=>{
    const user = req.user;
    const userEmail = user.email;

    try{
    const userToSend = await User.findOne({email:userEmail});
    const fetchedUser = {...userToSend.toObject()};
    const userWithWorkouts = fetchedUser.workouts;
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
        workouts.forEach(async workout => {
            const date = workout.date;
            const last_modified = workout.last_modified;
            const e_name = workout.e_name;
            const e_time = workout.time;
            const reps = workout.reps;
            const accuracy = workout.accuracy;

            const workout_exercise = {e_name:e_name,reps:reps,accuracy:accuracy};

            const userData = await User.findOne({email:userEmail});
            const workoutExists = userData.workouts.some(workout => workout.date === date)

            if (!workoutExists){
                const newWorkout = {
                    date : date,
                    time : e_time,
                    last_modified : last_modified,
                    exercise : [workout_exercise]
                }

                await User.updateOne(
                    {email:userEmail},
                    {$push:{workouts:newWorkout}}
                );
            }
            else{
                await User.updateOne(
                    {email:userEmail , 'workouts.date':date},
                    {
                        $push:{'workouts.$.exercise':workout_exercise},
                        $inc:{'workouts.$.time':e_time},
                        $set:{'workouts.$.last_modified':last_modified}
                    }
                );
            }

            const fetching =await  User.findOne({email:userEmail}, {workouts:1})
            console.log(fetching);
            const fetched_workouts = {...fetching.toObject()};
            return res.status(200).json(fetched_workouts);
        });
    }
    catch(error){
        console.log("Internal Server error " , error)
        return res.status(402).json({message:`Internal server error :  ${error}`})
    }
});

export {router as workoutRouter};