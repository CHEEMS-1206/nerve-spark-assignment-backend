import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";
import {
  Admin,
  User,
  Dealership,
  Deal,
  Car,
  SoldVehicle,
} from "../Models/models.mjs";

const initializeDatabase = async () => {
  const client = new MongoClient(process.env.DB_URI);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");

    const db = client.db(process.env.DB_NAME);

    // Check if collections exist before creating them
    const collections = await db.listCollections().toArray();

    const collectionNames = collections.map((collection) => collection.name);
    const requiredCollections = [
      "admins",
      "users",
      "dealerships",
      "deals",
      "cars",
      "sold_vehicles",
    ];

    const missingCollections = requiredCollections.filter(
      (collection) => !collectionNames.includes(collection)
    );

    for (const collection of missingCollections) {
      await db.createCollection(collection);
      console.log(`Collection "${collection}" created successfully`);
    }

    console.log("Database initialization completed");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await client.close();
  }
};

export default initializeDatabase;