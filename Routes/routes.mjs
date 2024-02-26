import express from "express";

import { login as adminLogin, register as adminRegister } from "../controllers/adminController.mjs";

const adminRouter = express.Router();
const userRoutes = express.Router();
const dealershipRoutes = express.Router();

// admin routes ("http://localhost:5001/api/admin)

adminRouter.post("/login", adminLogin); // login admin
adminRouter.post("/register", adminRegister); // register admin

// user routes  ("http://localhost:5001/api/user")
userRoutes.post("/login") // user login
userRoutes.post("/register"); // user register
userRoutes.get("/cars") // view all cars
userRoutes.get("/cars/dealership=?") // view all cars by dealers
userRoutes.get("/car/id") // about certain car
userRoutes.get("/car/deals") // deals on a certain car
userRoutes.post("/buy-car"); // add in owned vehicles
userRoutes.get("/my-vehicles") // all owned vehicles with dealer info
userRoutes.get("/my-vehicle/id") // every owned vehicle with info
userRoutes.get("/deals") // all deals
userRoutes.get("/deals/dealership=?") // all deals by dealers

// dealership routes ("http://localhost:5001/api/dealership")

dealershipRoutes.post("/login") // dealership login
dealershipRoutes.post("/register"); // dealers register
dealershipRoutes.get("/cars") // view all cars
dealershipRoutes.get("/cars/dealership=?") // view all cars by dealers
dealershipRoutes.post("/sell-car"); // sold vehicles me add
dealershipRoutes.get("/my-vehicles") // all sold vehicles with dealer info
dealershipRoutes.get("/my-vehicle/id") // every sold vehicle with info
dealershipRoutes.get("/deals") // all deals
dealershipRoutes.get("/deals/dealership=?") // by dealers
dealershipRoutes.post("/deals") // add new deal

// returning an object of all routers
const routers = {
  adminRouter,
  userRoutes,
  dealershipRoutes
};

export default routers;

// Implement a mechanism to invalidate JWT to facilitate logout and password change.
// Post requests should be able to handle multipart/form-data
// Implement asynchronous error handling using promises for all API endpoints. Handle and respond to any errors gracefully.
// Use ES6 compatible code i.e. use ES modules for import rather than common js import, use promises instead of callbacks etc.
// Provide basic Api documentation for your code.