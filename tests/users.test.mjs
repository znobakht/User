import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import app, { server } from "../app.mjs"; // Import your Express app
import User from "../models/User.mjs"; // Import your User model
const { MongoClient } = require("mongodb");
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "SayaDatabase";
describe("POST /users", () => {
  // Connect to a test database before running the tests
  let collection;
  let db;
  beforeAll(async () => {
    await client.connect();
    console.log("Connected successfully to server");
    db = client.db(dbName);
    collection = db.collection("users");
    await collection.deleteMany({});
  }, 10000);

  // Clear the User collection after each test
  afterEach(async () => {
    // await collection.deleteMany({});
  });

  // Disconnect from the test database after all tests are done
  afterAll(async () => {
    await client.close();
  });
  // Close the Express server
  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  // Disconnect from the MongoDB database
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should register a new user", async () => {
    // Mock request body data
    const userData = {
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      repeat_password: "password123",
    };

    // Make a POST request to create a new user
    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(200);
    // console.log(response.body)

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
    const users = await collection
      .find({ username: userData.username })
      .toArray();
    expect(users[0]).toBeTruthy();

    // Verify that the password is hashed in the database
    const isPasswordCorrect = await bcrypt.compare(
      userData.password,
      users[0].password
    );
    expect(isPasswordCorrect).toBe(true);
  });
  it("should not be able to register an old user", async () => {
    // Mock request body data
    const userData = {
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      repeat_password: "password123",
    };

    // Make a POST request to create a new user
    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(400);
    // console.log(response.body)

    // Assert response body
    expect(response.body).toHaveProperty(
      "error",
      "Username or email is already taken"
    );
  });

  // Add more test cases for validation errors, existing user, and internal server error cases
});
