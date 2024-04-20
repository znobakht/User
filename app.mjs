// app.mjs
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import userRouter from "./routes/api/users.mjs";

const app = express();

// Use the routers
app.use("/user", userRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

try {
const dbAddress = process.env.mongoURL || "mongodb://127.0.0.1:27017"
  await mongoose.connect(`${dbAddress}/SayaDatabase`);

  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}
