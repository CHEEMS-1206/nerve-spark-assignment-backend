// //table for car seller
// Table dealership {
//   dealership_email varchar [primary key]
//   dealership_id varchar [ note: 'randomly generated']
//   dealership_name varchar
//   dealership_location varchar
//   password password_hash
//   dealership_info json [note: 'dealership private data']
//   cars list_of_id
//   deals list_of_id
//   sold_vehicles list_of_id
// }

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mongodb from "mongodb";

import {
  validateEmail,
  validatePassword,
  validateDealershipInfo,
  validateDealershipName,
} from "../validators/Validator.mjs";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "30m";

// Get MongoDB client
const MongoClient = mongodb.MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri);

// Register a new dealership
export const dealershipRegister = async (req, res) => {
  try {
    await client.connect(); 
    const database = client.db(process.env.DB_NAME);
    const dealershipCollection = database.collection("dealerships");

    // Validate dealer input
    const {
      dealership_email,
      dealership_location,
      dealership_password,
      dealership_info,
      dealership_name,
    } = req.body;
    if (
      !validateEmail(dealership_email) ||
      !validatePassword(dealership_password) ||
      !validateDealershipInfo(dealership_info) ||
      !validateDealershipName(dealership_name)
    ) {
      return res.status(400).json({ error: "Invalid dealership input" });
    }

    // Check if the dealership is already registered
    const existingDealership = await dealershipCollection.findOne({
      dealership_email,
    });
    if (existingDealership) {
      return res.status(409).json({ error: "Dealership already exists" });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(dealership_password, 10);

    // Generate a random dealership ID
    const dealership_id = uuidv4();

    // Create a new user document
    const newDealership = {
      dealership_email,
      dealership_id,
      dealership_name,
      dealership_location,
      dealership_password_hash : password_hash,
      dealership_info,
      cars: [], // create empty cars, deals and sold_vehicle list
      deals: [],
      sold_vehicles: [],
    };

    // Insert the new dealership document into the database
    await dealershipCollection.insertOne(newDealership);

    // Return success response
    res.status(201).json({ message: "Dealership registered successfully" });
  } catch (error) {
    console.error("Error registering Dealership:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// Login user
export const dealershipLogin = async (req, res) => {
  try {
    // Validate user input
    const { dealership_email, dealership_password } = req.body;
    if (
      !validateEmail(dealership_email) ||
      !validatePassword(dealership_password)
    ) {
      return res.status(400).json({ error: "Invalid dealership input" });
    }

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const dealershipCollection = database.collection("dealerships");

    // Find user by email
    const dealership = await dealershipCollection.findOne({ dealership_email });
    if (!dealership) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      dealership_password,
      dealership.dealership_password_hash
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { dealership_id: dealership.dealership_id },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY,
      }
    );

    // Return token
    res.status(200).json({ token, dealership_id : dealership.dealership_id });
  } catch (error) {
    console.error("Error logging in dealership:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// validate dealership token
export const validateDealership = async (req, res) =>{
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
      const { dealership_id } = decoded;
      res.status(200).json({ dealership_id, message: "Valid Token" });
      return;
    }
  } catch (error) {
    console.error("Token verification error:", error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ msg: "Token expired, please login again." });
    } else if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.NotBeforeError
    ) {
      res.status(403).json({ msg: "Invalid token." });
    } else {
      res.status(500).json({ msg: "Internal server error." });
    }
  }
}

// gell all vehicles owned by dealership
export const allCarsForSaleAtDealership = async (req, res) => {
  try {
    const dealership_id = req.headers.dealership_id;

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const dealershipsCollection = database.collection("dealerships");
    const carsCollection = database.collection("cars");

    // Find dealership by ID
    const dealership = await dealershipsCollection.findOne({ dealership_id });
    if (!dealership) {
      return res.status(404).json({ error: "Dealership not found" });
    }

    // Fetch cars for sale at dealership
    const dealershipCars = await carsCollection
      .find({ car_id: { $in: dealership.cars } })
      .toArray();

    // Return the list of cars for sale at the dealership
    res.status(200).json(dealershipCars);
  } catch (error) {
    console.error("Error fetching cars for dealership", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// get vehicle details owned by me
export const carForSaleAtDealership = async (req, res) => {
  try {
    const dealership_id = req.headers.dealership_id;
    const {car_id} = req.params;

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const dealershipsCollection = database.collection("dealerships");
    const carsCollection = database.collection("cars");

    // Find dealership by ID
    const dealership = await dealershipsCollection.findOne({ dealership_id });
    if (!dealership) {
      return res.status(404).json({ error: "Dealership not found" });
    }

    // Check if the dealership has that car
    if (!dealership.cars.includes(car_id)) {
      return res.status(404).json({ error: "Car not found for the sale at this dealer" });
    }

    // Fetch the car by ID
    const car = await carsCollection.findOne({ car_id });

    // Return the car for sale at dealership
    res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car by dealership:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

// Post new deal
export const postNewDeal = async (req, res) => {
  try {
    const { car_id, deal_info } = req.body;
    const dealership_id = req.headers.dealership_id;

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const dealsCollection = database.collection("deals");
    const dealershipsCollection = database.collection("dealerships");

    // Find the dealership by name
    const dealership = await dealershipsCollection.findOne({ dealership_id });
    if (!dealership) {
      return res.status(404).json({ error: "Dealership not found" });
    }

    // Generate deal ID
    const deal_id = uuidv4();
    // Push deal ID to the dealership's deals array
    await dealershipsCollection.updateOne(
      { dealership_id },
      { $push: { deals: deal_id } }
    );

    // Create new deal object
    const newDeal = {
      deal_id,
      car_id,
      deal_info,
    };

    // Insert new deal into database
    await dealsCollection.insertOne(newDeal);

    res.status(201).json({ message: "Deal posted successfully" });
  } catch (error) {
    console.error("Error posting deal:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Close the MongoDB client connection
    await client.close();
  }
};

export const addNewCar = async (req, res) => {
  try {
    const { car_id, type, name, model, car_info } = req.body;
    const dealership_id = req.headers.dealership_id;

    // Convert launch date string to Date object
    const launch_date = new Date(car_info.launch_date);

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const carsCollection = database.collection("cars");
    const dealershipCollection = database.collection("dealerships");

    // Check if the car ID already exists
    const existingCar = await carsCollection.findOne({ car_id });
    if (existingCar) {
      return res.status(409).json({ error: "Car ID already exists" });
    }

    // Create a new car document
    const newCar = {
      car_id,
      type,
      name,
      model,
      car_info: {
        ...car_info,
        launch_date, // Add launch date as Date object
      },
    };

    // Insert the new car document into the database
    await carsCollection.insertOne(newCar);

    // Update the dealership document to include the new car ID
    await dealershipCollection.updateOne(
      { dealership_id },
      { $addToSet: { cars: car_id } }
    );

    // Return success response
    res.status(201).json({ message: "Car added successfully" });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};