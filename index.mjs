// Server entry point //

// Necessary imports
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Constructed a server
const SERVER = express();
import initializeDatabase from './Config/config.mjs'
import routers from "./Routes/routes.mjs";
import { addCar } from "./Controllers/CarPost.mjs";

// Parsing the JSON, CORS policy, URL encoding, and JSON formatting
SERVER.use(bodyParser.json());
SERVER.use(cors());
SERVER.use(express.urlencoded({ extended: true }));
SERVER.use(express.json());

// MIDDLEWARE
SERVER.use("/api/admin",routers.adminRouter)
SERVER.use("/api/user",routers.userRoutes)
SERVER.use("/api/dealership",routers.dealershipRoutes)
SERVER.use("/api/add-car",addCar)

// Defining port for backend rest server
const PORT = 5001;

// Run the server at PORT
SERVER.listen(PORT, () =>
  console.log(`server running at: http://localhost:${PORT} `)
);
initializeDatabase().catch(console.error);