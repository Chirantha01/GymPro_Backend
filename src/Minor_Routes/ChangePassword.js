import express from "express";
import { authenticateToken } from "../Middleware/Validate_Tokens.js";
import { body } from "express-validator";
import { validateRequest } from "../Middleware/Validate_Requests.js";
import { User } from "../db.js";
import bcrypt from 'bcryptjs'; // To hash passwords

const router = express.Router();

router.post(
  "/changePassword",
  [
    // Validation for the old and new passwords
    body("oldPassword")
      .notEmpty()
      .withMessage("Old password is required!")
      .bail(),
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
    try {
      const user = req.user; // Get the user from the token
      const email = user.email;

      const { oldPassword, newPassword } = req.body;

      // Retrieve user from the database using the email
      const existingUser = await User.findOne({ email:email });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found!" });
      }

      // Compare oldPassword with the stored hashed password
      const isMatch = await bcrypt.compare(oldPassword, existingUser.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect old password!" });
      }

      // Hash the new password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the password in the database
      await User.updateOne(
        { email },
        {
          $set: { password: hashedPassword },
        }
      );

      return res.status(201).json({ message: "Password updated successfully!" });
    } catch (err) {
      console.log("Error occurred while updating password: ", err);
      return res.status(500).json({ error: "Error occurred while updating password" });
    }
  }
);

export { router as changePasswordRouter };
