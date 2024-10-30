import express from "express";
import nodemailer from "nodemailer";
import { User } from "../db.js";
import crypto from "crypto"; // For generating OTP
import jwt from "jsonwebtoken";
import { authenticateToken } from "../Middleware/Validate_Tokens.js";
import { body } from "express-validator";

const router = express.Router();

// Setup nodemailer transporter (use your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

router.post("/requestPasswordReset", [body("email").isEmail().withMessage("E mail must be valid")],
  async (req, res) => {
  

  try {
    const email = req.body.email; // Get the user from the token
    //const email = client.email;
    const user = await User.findOne({ email:email });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Optionally, you could store OTP in the user record or in-memory with expiry
    user.otp = otp;
    user.otpExpires = Date.now() + 60000; // OTP valid for 1 hour
    await user.save();

    console.log(otp);

    // Send OTP to user's email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    });

    return res.status(200).json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ error: "Failed to send OTP." });
  }
});

export { router as requestPasswordResetRouter };
