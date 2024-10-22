import express from "express";
import bcrypt from "bcryptjs";
import { authenticateToken } from "../Middleware/Validate_Tokens.js";
import { User } from "../db.js";

const router = express.Router();

router.delete(
  "/deleteUser",
  authenticateToken, // Middleware to authenticate user using JWT
  async (req, res) => {
    try {
      const user = req.user; // Extract the user info from the token
      const email = user.email; // Assuming the email is stored in the token

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required to delete the account!" });
      }

      // Find the user in the database by their email
      const existingUser = await User.findOne({ email: email });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found!" });
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, existingUser.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Incorrect password!" });
      }

      // If password is correct, delete the user
      await User.findOneAndDelete({ email: email });

      return res.status(200).json({ message: "User deleted successfully!" });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Error occurred while deleting user" });
    }
  }
);

export { router as deleteUserRouter };
