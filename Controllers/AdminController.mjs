// //table for admin
// Table admin {
//   admin_id varchar [primary key]
//   password password_hash
// }

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mongodb from "mongodb";

import {
  validateEmail,
  validatePassword,
} from "../validators/Validator.mjs";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "30m";

// Get MongoDB client
const MongoClient = mongodb.MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri);

// Register a new admin
export const adminRegister = async (req, res) => {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const adminCollection = database.collection("admins");

    // Validate admin email and password
    const { admin_email, admin_password } = req.body;
    if (
      !validateEmail(admin_email) ||
      !validatePassword(admin_password)
    ) {
      return res.status(400).json({ error: "Invalid admin input" });
    }

    // Check if the admin is already registered
    const existingAdmin = await adminCollection.findOne({ admin_email });
    if (existingAdmin) {
      return res.status(409).json({ error: "Admin already exists" });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(admin_password, 10);

    // Generate a random admin ID
    const admin_id = uuidv4();

    // Create a new admin document
    const newAdmin = {
      admin_id,
      admin_email,
      admin_password_hash : password_hash,
    };

    // Insert the new user document into the database
    await adminCollection.insertOne(newAdmin);

    // Return success response
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// Login user
export const adminLogin = async (req, res) => {
  try {
    // Validate admin input
    const { admin_email, admin_password } = req.body;
    if (!validateEmail(admin_email) || !validatePassword(admin_password)) {
      return res.status(400).json({ error: "Invalid admin input" });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const adminCollection = database.collection("admins");

    // Find admin by email
    const admin = await adminCollection.findOne({ admin_email });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      admin_password,
      admin.admin_password_hash
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ admin_id: admin.admin_id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    // Return token
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};