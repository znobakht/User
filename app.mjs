// app.mjs
import express from "express";
import userRouter from "./routes/api/users.mjs"

const app = express();

// Use the routers
app.use("/user", userRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
