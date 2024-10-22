import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../db.js";
import { authenticateToken } from "../Middleware/Validate_Tokens.js";
import { body } from "express-validator";
import { validateRequest } from "../Middleware/Validate_Requests.js";

const router = express.Router();

router.post("/resetPassword",
  [
    body("newPassword")
      .isLength({min:4 , max:20})
      .withMessage("New Password must be between 4 to 20 characters")
      .bail()
      .matches(/\d/)
      .withMessage("Password must contain at least one number!")
      .bail()
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter!")
      .bail()
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter!")
      .bail()
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character!")
      .bail()
  ],
  validateRequest,
  authenticateToken, 
  async (req, res) => {
  const {otp, newPassword } = req.body;
  const client = req.user; // Get the user from the token
  const email = client.email;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Check if OTP is correct and not expired
    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP!" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear OTP
    user.password = hashedPassword;
    user.otp = null; // Clear OTP
    user.otpExpires = null; // Clear OTP expiration
    await user.save();

    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

export { router as resetPasswordRouter };
