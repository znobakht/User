import express from "express";
import { registrationSchema } from "../../validation/validationSchemas.mjs";
import User from "../../models/User.mjs";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World");
});
router.post("/", async (req, res)=>{
  const { error, value } = registrationSchema.validate(req.body);
  if (error) {
    // Return validation errors
    return res
      .status(400)
      .json({ error: error.details.map((detail) => detail.message) });
  }

  try {
    // Check if the username or email is already taken
    const existingUser = await User.findOne({ $or: [{ username: value.username }, { email: value.email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email is already taken' });
    }

    // Create a new user
    const newUser = new User({
      name: value.name,
      username: value.username,
      email: value.email,
      password: value.password, // Note: In practice, you would hash the password before storing it
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with success message
    res.json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
} )

export default router;
