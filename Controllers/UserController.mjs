// //table for car buyer
// Table user {
//   user_email varchar [primary key]
//   user_id varchar [note: 'randomly generated']
//   user_location varchar
//   user_info json [note: 'user private data']
//   password password_hash
//   vehicle_info list_of_id
// }

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mongodb from "mongodb";

import {
  validateEmail,
  validatePassword,
  validateUserInfo,
} from "../validators/Validator.mjs";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "30m";

// Get MongoDB client
const MongoClient = mongodb.MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri);

// Register a new user
export const userRegister = async (req, res) => {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    // Validate user input
    const { user_email, user_location, user_password, user_info } = req.body;
    if (
      !validateEmail(user_email) ||
      !validatePassword(user_password) ||
      !validateUserInfo(user_info)
    ) {
      return res.status(400).json({ error: "Invalid user input" });
    }

    // Check if the email is already registered
    const existingUser = await usersCollection.findOne({ user_email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(user_password, 10);

    // Generate a random user ID
    const user_id = uuidv4();

    // Create a new user document
    const newUser = {
      user_email,
      user_id,
      user_location,
      user_password_hash : password_hash,
      user_info,
      vehicle_info: [], // Initialize empty array for vehicle_info
    };

    // Insert the new user document into the database
    await usersCollection.insertOne(newUser);

    // Return success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// Login user
export const userLogin = async (req, res) => {
  try {
    // Validate user input
    const { user_email, user_password } = req.body;
    if (!validateEmail(user_email) || !validatePassword(user_password)) {
      return res.status(400).json({ error: "Invalid user input" });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    // Find user by email
    const user = await usersCollection.findOne({ user_email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(user_password, user.user_password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    // Return token
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};