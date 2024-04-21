// app.mjs
import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import cors from "cors";
app.use(cors());

import userRouter from "./routes/api/users.mjs";


// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use the routers
app.use("/users", userRouter);

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
(async () => {
  try {
    const dbAddress = process.env.mongoURL || "mongodb://127.0.0.1:27017";
    await mongoose.connect(`${dbAddress}/SayaDatabase`);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

export default app

export {server}

