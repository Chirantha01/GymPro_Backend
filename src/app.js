import express from "express";
import cors from "cors";
import dotenv from 'dotenv';

import {signupRouter} from './Routes/SignUp.js';
import { signinRouter } from "./Routes/SignIn.js";
import { startupRouter } from "./Routes/StartUp.js";
import { homeRouter } from "./Routes/Home.js";
import { workoutRouter } from "./Routes/Workout.js";

//init app
const app = express();

//middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use(signupRouter);
app.use(signinRouter);
app.use(startupRouter);
app.use(homeRouter);
app.use(workoutRouter);

app.all("*", async (req, res) => {
    //looks for the paths we dont have
    throw new NotFoundError();
});

export { app };



