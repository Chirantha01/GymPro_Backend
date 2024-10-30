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
    // const userToSend = await User.findOne({email:userEmail});
    // const fetchedUser = {...userToSend.toObject()};
    const userWithWorkouts = await extractAllWorkoutAccuracies(userEmail);
    console.log(userWithWorkouts);

    const bicepCurl ={daily:[],monthly:[],yearly:[]};
    const squat = {daily:[],monthly:[],yearly:[]};
    const latPullDown = {daily:[],monthly:[],yearly:[]};
    const pushUp = {daily:[],monthly:[],yearly:[]};
    const plank = {daily:[],monthly:[],yearly:[]};

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsOfYear = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // userWithWorkouts.forEach(async workout =>{
    //     const date = new Date(workout.date);
    //     const date_number = date.getDay();
    //     const date_label = daysOfWeek[date_number];
    //     const month = workout.date.slice(0, 7);
    //     const month_number = date.getMonth();
    //     const month_label = monthsOfYear[month_number];
    //     const year = workout.date.slice(0,4);

    //     const exercises = workout.exercise;


    // })
    console.log("giving a response with workouts")
    return res.status(200).json({workouts:userWithWorkouts});
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

            const workout_exercise = {e_name:e_name,reps:reps,time:e_time,accuracy:accuracy};

            const userData = await User.findOne({email:userEmail});
            const workoutExists = userData.workouts.some(workout => workout.date === date);
            const exerciseExists = userData.workouts.some(workout => 
                workout.date === date && 
                workout.exercise.some(ex => ex.e_name === e_name)
            );
            console.log("exerciseExists : ", exerciseExists);

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

                const fetching =await  User.findOne({email:userEmail}, {workouts:1})
                console.log(fetching);
                const fetched_workouts = {...fetching.toObject()};
                return res.status(200).json(fetched_workouts);
            }
            else if(exerciseExists){
                const workoutIndex = userData.workouts.findIndex(workout => workout.date === date);
                const exerciseIndex = userData.workouts[workoutIndex].exercise.findIndex(ex => ex.e_name === e_name);

                if (workoutIndex !== -1 && exerciseIndex !== -1) {
                    const oldExercise = userData.workouts[workoutIndex].exercise[exerciseIndex];
                    const old_accuracy = oldExercise.accuracy || 0;
                    const old_reps = oldExercise.reps || 0;

                    const new_accuracy = (accuracy * reps + old_accuracy * old_reps) / (reps + old_reps);
                    const updated_reps = reps + old_reps;

                    const updateQuery = {};
                    updateQuery[`workouts.${workoutIndex}.exercise.${exerciseIndex}.accuracy`] = new_accuracy;
                    updateQuery[`workouts.${workoutIndex}.exercise.${exerciseIndex}.reps`] = updated_reps;
                    updateQuery[`workouts.${workoutIndex}.last_modified`] = last_modified;

                    // Update workout time
                    await User.updateOne(
                        { email: userEmail, 'workouts.date': date },
                        { $inc: { 'workouts.$.time': e_time } }
                    );


                    await User.updateOne(
                        { email: userEmail },
                        {
                            $set: updateQuery,
                            $inc: { [`workouts.${workoutIndex}.exercise.${exerciseIndex}.time`]: e_time }
                        }
                    );
                }

                const fetching =await  User.findOne({email:userEmail}, {workouts:1})
                console.log(fetching);
                const fetched_workouts = {...fetching.toObject()};
                return res.status(200).json(fetched_workouts);
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

const extractAllWorkoutAccuracies = async (userEmail) => {
    try {
      const result = await User.aggregate([
        // Match the specific user
        { $match: { email: userEmail } },
        
        // Unwind the workouts array
        { $unwind: "$workouts" },
  
        // Unwind the exercises array inside each workout
        { $unwind: "$workouts.exercise" },
  
        // Group the exercises by workout date and create the accuracy objects
        { 
          $group: {
            _id: "$workouts.date",  // Group by date
            date: { $first: "$workouts.date" },
            time: {$first: "$workouts.time"},
            accuracy: { $push: { 
              k: { $concat: [ "$workouts.exercise.e_name", "_accuracy" ] }, 
              v: "$workouts.exercise.accuracy" 
            } },
            e_time: { $push: { 
                k: { $concat: [ "$workouts.exercise.e_name", "_time" ] }, 
                v: "$workouts.exercise.time" 
              } },
            e_reps: { $push: { 
                k: { $concat: [ "$workouts.exercise.e_name", "_reps" ] }, 
                v: "$workouts.exercise.reps" 
            } }
          }
        },
  
        // Project the final result into the required format
        { 
          $project: {
            _id: 0,
            date: 1,
            time: 1,
            accuracy: { $arrayToObject: "$accuracy" },
            e_time: { $arrayToObject: "$e_time" },
            e_reps: { $arrayToObject: "$e_reps" },
          }
        },
  
        // Sort by workout date (optional)
        { $sort: { date: 1 } }
      ]);

    const temp = await User.findOne({email:userEmail}, {workouts:1});
    const temp_workouts =temp.workouts
      // Get the first and last workout dates
    const firstWorkoutDate = new Date(temp_workouts[0].date);
    const lastWorkoutDate = new Date(temp_workouts[temp_workouts.length - 1].date);

    // Generate all dates between first and last workout date
    const allDates = generateDateRange(firstWorkoutDate, lastWorkoutDate);

    // Create a map of dates for fast lookup of existing workout data
    const workoutMap = new Map(result.map((workout) => [workout.date, workout]));

    // Create the final array with gaps filled
    const final_result = allDates.map((date) => {
      const dateString = date.toISOString().slice(0, 10); // Format as YYYY-MM-DD
      const workout = workoutMap.get(dateString);

      return workout || {
        date: dateString,
        time: 0,
        accuracy: {},
        e_time: {},
        e_reps:{}
      };
    });

      console.log(final_result);
      return final_result;
    } catch (err) {
      console.log(err);
    }
  };

const generateDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1); // Increment day by 1
    }

    return dates;
};
  

export {router as workoutRouter};