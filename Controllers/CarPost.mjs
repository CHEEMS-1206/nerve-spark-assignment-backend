import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mongodb from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "30m";

// Get MongoDB client
const MongoClient = mongodb.MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri);

//table for info on cars
// Table cars{
//   car_id varchar [primary key, note: 'randomly generated']
//   type varchar
//   name varchar
//   model varchar
//   car_info json [note: 'store additional fields']
// }

export const addCar = async (req, res) => {
  try {
    const { car_id, type, name, model, car_info } = req.body;

    // Convert launch date string to Date object
    const launch_date = new Date(car_info.launch_date);

    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const carsCollection = database.collection("cars");

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

    // Return success response
    res.status(201).json({ message: "Car added successfully" });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

//table for car seller
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
