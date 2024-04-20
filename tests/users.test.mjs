import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import app from "../app.mjs"; // Import your Express app
import User from "../models/User.mjs"; // Import your User model

describe("POST /users", () => {
  // Store reference to the MongoDB connection
  let db;

  // Connect to a test database before running the tests
  beforeAll(async () => {
    db = await mongoose.connect("mongodb://localhost:27017/testdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the User collection after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect from the test database after all tests are done
  afterAll(async () => {
    await db.disconnect();
  });

  it("should register a new user", async () => {
    // Mock request body data
    const userData = {
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    // Make a POST request to create a new user
    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(200);

    // Assert response body
    expect(response.body).toHaveProperty(
      "message",
      "User registered successfully"
    );
    expect(response.body.user).toHaveProperty("name", userData.name);
    expect(response.body.user).toHaveProperty("username", userData.username);
    expect(response.body.user).toHaveProperty("email", userData.email);

    // Verify that the password is not returned in the response
    expect(response.body.user).not.toHaveProperty("password");

    // Verify that the user is saved in the database
    const user = await User.findOne({ username: userData.username });
    expect(user).toBeTruthy();

    // Verify that the password is hashed in the database
    const isPasswordCorrect = await bcrypt.compare(
      userData.password,
      user.password
    );
    expect(isPasswordCorrect).toBe(true);
  });

  // Add more test cases for validation errors, existing user, and internal server error cases
});
