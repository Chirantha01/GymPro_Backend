import {User} from './db.js';
import dotenv from 'dotenv';
import { app } from "./app.js";
import mongoose from 'mongoose';

dotenv.config();

const PORT = process.env.PORT || 4000;

const start = async () => {

    mongoose.connect(process.env.DB_ATLAS_URI , {
        UseNewUrlParser : true,
        useUnifiedTopology : true,
    })
        .then(() => console.log("MongoDB is connected"))
        .catch((err) => console.log("Error connecting to MongoDB : ", err));

    app.listen(PORT , ()=>{
        console.log(`Server is listening to the port ${PORT}`)
    });
}
start();

export default app;