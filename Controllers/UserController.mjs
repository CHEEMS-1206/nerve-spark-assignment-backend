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

// get all cars
export const getAllCars = async (req, res) => {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const carsCollection = database.collection("cars");
    
    const allCars = await carsCollection.find({}).toArray();
    
    res.status(200).json(allCars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// Get all cars by dealership
export const getCarByDealership = async (req, res) => {
  try {
    const { dealership_name } = req.params;

    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const carsCollection = database.collection("cars");
    const dealershipCollection = database.collection("dealerships");

    // Find the dealership document
    const dealership = await dealershipCollection.findOne({ dealership_name });
    if (!dealership) {
      return res.status(404).json({ error: "Dealership not found" });
    }

    // Retrieve the list of car IDs associated with the dealership
    const carIdsInDealership = dealership.cars;

    // Fetch the details of all cars whose IDs match the ones associated with the dealership
    const dealershipCars = await carsCollection.find({ car_id: { $in: carIdsInDealership } }).toArray();

    res.status(200).json(dealershipCars);
  } catch (error) {
    console.error("Error fetching cars by dealership:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// get a certain car by id 
export const getCarById = async (req, res) => {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const carsCollection = database.collection("cars");
    
    const { car_id } = req.params;
    
    const car = await carsCollection.findOne({ car_id: car_id });
    
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    
    res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// gell all vehicles owned by me
export const getCarsByUser = async (req, res) => {
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
export const getCarByUser = async (req, res) => {
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

// get all deals for any car
export const getDealsForCar = async (req, res) => {
  try {
    // Extract the car ID from the request parameters
    const { car_id } = req.params;

    // Connect to the database
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const dealsCollection = database.collection("deals");

    // Find all deals associated with the specified car ID
    const carDeals = await dealsCollection.find({ car_id }).toArray();

    // Return the deals
    res.status(200).json(carDeals);
  } catch (error) {
    console.error("Error fetching deals for car:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close()
  }
};
