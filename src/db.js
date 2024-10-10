import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.DB_ATLAS_URI , {
    UseNewUrlParser : true,
    useUnifiedTopology : true,
})
    .then(() => console.log("MongoDB is connected"))
    .catch((err) => console.log("Error connecting to MongoDB : ", err));

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique:true},
    email:{type:String , required:true, unique:true},
    password:{type:String, required:true},
    profile_Photo: { type: String, required: true },
    bDay: { type: String, required: true },
    height: { type: String, required: true },
    weight: { type: String, required: true },
    workouts: [{
        date: { type: String, required: true },
        time: { type: Number, required: true },
        exercise: [{
            e_name: { type: String, required: true },
            reps: { type: Number, required: true },
            accuracy: { type: Number, required: true }
        }]
    }] || {type:Array , default:[]}
});

// const userSchema = new mongoose.Schema({
//     name: String,
//     age: Number
// })
    
export const User = mongoose.model('users', userSchema);

