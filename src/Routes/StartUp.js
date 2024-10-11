import express from "express";
import {authenticateToken} from "../Middleware/Validate_Tokens.js";

const router = express.Router();

router.post(
    "/startup",
    authenticateToken,
    async (req , res) =>{
        try{
            console.log("Token success")
            return res.status(200).json({token_Status:true})
        }
        catch(err){
            console.log(err);
            res.status(500).json({error:"Internal Server Error"});
        }
    }
);

export {router as startupRouter};