import express from "express";
import {User} from './db.js';
import cors from "cors";
import dotenv from 'dotenv';

import {signupRouter} from './Routes/SignUp.js';

//init app
const app = express();

//middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use(signupRouter);

app.all("*", async (req, res) => {
    //looks for the paths we dont have
    throw new NotFoundError();
});

export { app };


// //Middleware for JWT Authentication
// function generateAccessToken(user) {
//     const payload = {
//       id: user._id,
//       email: user.email
//     };
    
//     const secret = JWT_SECRET;
//     const options = { expiresIn: '1h' };
  
//     return jwt.sign(payload, secret, options);
// }

// //token validation 
// app.post('/validate', (req,res) =>{
//     console.log("token validation started")
//     const data = req.body;
//     const token = data.token;
//     console.log("Verifying token...");
//     const validity = verifyAccessToken(token);
//     console.log(validity);
//     return res.json(validity);

// })

// //SIGN IN
// app.post('/signin', async (req , res)=>{

//     const {usernameOrEmail , password} = req.body;
//     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);

//     try{
//         if(isEmail){
//             const user1 = await User.findOne({email:usernameOrEmail});
//             if (!user1){
//                 return res.status(400).json({message:"Email not found"});
//             }
//             const isPasswordValid = await bycrypt.compare(password , user1.password);

//             if (!isPasswordValid){
//                 return res.status(400).json({message:"Password is wrong!"});
//             }

//             const token = generateAccessToken(user1);
//             const userWithoutPassword = {...user1.toObject()};
//             delete userWithoutPassword.password;

//             return res.status(200).json({token:token,user:userWithoutPassword});
//         }

//         const user2 = await User.findOne({userName:usernameOrEmail});
//             if (!user2){
//                 return res.status(400).json({message:"UserName not found"});
//             }
//             const isPasswordValid = await bycrypt.compare(password , user2.password);

//             if (!isPasswordValid){
//                 return res.status(400).json({message:"Password is wrong!"});
//             }

//             const token = generateAccessToken(user2);
//             const userWithoutPassword = {...user2.toObject()};
//             delete userWithoutPassword.password;

//             return res.status(200).json({token:token,user:userWithoutPassword});

        
//     }
//     catch(err){
//         console.error(err);
//         res.status(500).json({error:"Internal Server Error"});
//     }
// });

// app.get('/home' , authenticateToken , async(req , res)=>{
//     const user = req.user;
//     const userEmail = user.email;

//     try{
//     const userToSend = await User.findOne({email:userEmail});
//     const userWithoutPassword = {...userToSend.toObject()};
//     delete userWithoutPassword.password;
//     return res.status(200).json(userWithoutPassword);
//     }
//     catch(error){
//         console.error("Data Fetching error for home screen" , error);
//         res.status(400).json({message:"User Not Found"});
//     }
// });

// app.get('/workouts' , authenticateToken , async(req , res)=>{
//     const user = req.user;
//     const userEmail = user.email;

//     try{
//     const userToSend = await User.findOne({email:userEmail});
//     const fetchedUser = {...userToSend.toObject()};
//     userWithWorkouts = fetchedUser.workouts;
//     return res.status(200).json(userWithWorkouts);
//     }
//     catch(error){
//         console.error("Data Fetching error for Workout History screen" , error);
//         res.status(400).json({message:"Workouts not found" , workouts:[]});
//     }
// });

// app.post('/workouts' , authenticateToken , async(req , res)=>{
//     const user = req.user;
//     const userEmail = user.email;
//     const workouts = req.body.workouts;

//     try{
//     const userToSend = await User.findOne({email:userEmail});
//     const fetchedUser = {...userToSend.toObject()};
//     userWithWorkouts = fetchedUser.workouts;
//     return res.status(200).json(userWithWorkouts);
//     }
//     catch(error){
//         console.error("Data Fetching error for Workout History screen" , error);
//         res.status(400).json({message:"Workouts not found" , workouts:[]});
//     }
// });

