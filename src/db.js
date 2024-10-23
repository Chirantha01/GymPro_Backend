import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true},
    email:{type:String , required:true, unique:true},
    password:{type:String, required:true},
    profile_Photo: { type: String },
    bDay: { type: String },
    height: { type: String },
    weight: { type: String },
    otp: { type: String },
    otpExpires: { type: String },
    workouts: [{
        date: { type: String, required: true },
        time: { type: Number, required: true },
        last_modified: {type: String , required:true},
        exercise: [{
            e_name: { type: String, required: true },
            reps: { type: Number, required: true },
            time: { type: Number, required: true },
            accuracy: { type: Number, required: true }
        }]
    }] || {type:Array , default:[]}
});

// const userSchema = new mongoose.Schema({
//     name: String,
//     age: Number
// })
    
export const User = mongoose.model('users', userSchema);

