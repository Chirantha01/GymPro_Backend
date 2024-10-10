import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
    "/signup" , 
    [
        body("email").isEmail().withMessage("E mail must be valid"),
        body("password")
            .trim()
            .isLength({min:4 , max:20})
            .withMessage("Password must be between 4 to 20 characters")
    ]
);