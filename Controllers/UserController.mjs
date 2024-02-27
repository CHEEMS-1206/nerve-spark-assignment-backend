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

// logging out user
export const userLogout = async (req,res) => {
}

// gell all vehicles owned by me
export const getMyCarsDetails = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    const carsCollection = database.collection("cars");

    // Find user by ID
    const user = await usersCollection.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch cars owned by the user
    const userCars = await carsCollection
      .find({ car_id: { $in: user.vehicle_info } })
      .toArray();

    // Return the list of cars owned by the user
    res.status(200).json(userCars);
  } catch (error) {
    console.error("Error fetching cars by user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// get vehicle details owned by me
export const getMyCarDetails = async (req, res) => {
  try {
    const { user_id, car_id } = req.params;

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    const carsCollection = database.collection("cars");

    // Find user by ID
    const user = await usersCollection.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user owns the specified car
    if (!user.vehicle_info.includes(car_id)) {
      return res.status(404).json({ error: "Car not found for the user" });
    }

    // Fetch the car by ID
    const car = await carsCollection.findOne({ car_id });

    // Return the car owned by the user
    res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car by user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// add sold vehicles
export const addSoldVehicles = async (req, res) => {
  try {
    // Extract data from the request body
    const { user_id, car_id, dealership_id } = req.body;

    // Connect to the database
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    const dealershipsCollection = database.collection("dealerships");
    const soldVehiclesCollection = database.collection("sold_vehicles");

    // Fetch user and dealership details
    const user = await usersCollection.findOne({ user_id });
    const dealership = await dealershipsCollection.findOne({ dealership_id });
    
    // Check if the car is available in the seller's dealership
    if (!dealership || !dealership.cars.includes(car_id)) {
      return res.status(404).json({ error: "Car not found in dealership" });
    }
    // Generate a new ID for the sold vehicle
    const vehicle_id = `${car_id}-${uuidv4()}`;

    // Update user's vehicle info
    await usersCollection.updateOne(
      { user_id },
      { $push: { vehicle_info: vehicle_id } }
    );

    // Update dealership's sold vehicles
    await dealershipsCollection.updateOne(
      { dealership_id },
      { $push: { sold_vehicles: vehicle_id } }
    );

    // Create a new entry in the sold vehicles collection
    const carInfo = await database.collection("cars").findOne({ car_id });
    const vehicle_info = {
      type: carInfo.type,
      name: carInfo.name,
      model: carInfo.model,
    };
    await soldVehiclesCollection.insertOne({
      vehicle_id,
      car_id,
      vehicle_info,
    });

    // Respond with success message
    res.status(201).json({ message: "Sold vehicle added successfully" });
  } catch (error) {
    console.error("Error adding sold vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};