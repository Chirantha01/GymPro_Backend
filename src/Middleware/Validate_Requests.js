//import json from "body-parser/lib/types/json";
import { validationResult } from "express-validator";

export const validateRequest = (req , res ,next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()){
        console.log("validating request...")
        console.log(errors.array());
        return res.status(400).json({
            errors:errors.array().map(err =>({
                message:err.msg,
                field:err.path
            })),
            success:false
        })
        // throw new Error(
        //     JSON.stringify(errors.array().map(err =>({
        //         message: err.msg,
        //         field : err.path
        //     })))
        // );
         
    }
    next();
}