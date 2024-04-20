import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema, registrationSchema } from "../../validation/validationSchemas.mjs";
import User from "../../models/User.mjs";
import authMiddleware from "../../middleware/authMiddleware.mjs";

const router = express.Router();

// Route to get all users with pagination
router.get("/", authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Number of items per page, default to 10 if not provided

  try {
    // Query the database for users with pagination
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total number of users
    const totalUsers = await User.countDocuments();

    // Calculate total number of pages
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post("/", async (req, res) => {
  const { error, value } = registrationSchema.validate(req.body);
  if (error) {
    // Return validation errors
    return res
      .status(400)
      .json({ error: error.details.map((detail) => detail.message) });
  }

  try {
    // Check if the username or email is already taken
    const existingUser = await User.findOne({
      $or: [{ username: value.username }, { email: value.email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email is already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Create a new user
    const newUser = new User({
      name: value.name,
      username: value.username,
      email: value.email,
      password: hashedPassword, // Note: In practice, you would hash the password before storing it
    });

    // Save the new user to the database
    await newUser.save();
    // Omit password from newUser
    const { password, __v, ...userWithoutPassword } = newUser.toObject();

    // Respond with success message
    res.json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((detail) => detail.message) });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email: value.email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(value.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Password is correct, generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Respond with success message and JWT token
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
