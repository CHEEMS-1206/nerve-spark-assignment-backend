import express from "express";

import {
  adminRegister,
  adminLogin,
  validateAdmin,
} from "../controllers/adminController.mjs";

import {
  userRegister,
  userLogin,
  validateUser,
  getMyCarsDetails,
  getMyCarDetails,
  addSoldVehicles,
} from "../Controllers/UserController.mjs";

import {
  dealershipRegister,
  dealershipLogin,
  validateDealership,
  allCarsForSaleAtDealership,
  carForSaleAtDealership,
  postNewDeal,
  addNewCar
} from "../Controllers/DealerShipController.mjs";

import {
  getAllCars,
  getCarById,
  getCarByDealership,
  getAllDeals,
  getAllDealsForASpecificDealer,
  getDealsForCar
} from "../Controllers/GeneralController.mjs";

// defining routers
const adminRoutes = express.Router();
const userRoutes = express.Router();
const dealershipRoutes = express.Router();
const generalRoutes = express.Router();

// admin routes ("http://localhost:5001/api/admin)
adminRoutes.post("/login", adminLogin); // login admin
adminRoutes.post("/register", adminRegister); // register admin
adminRoutes.post("/validate-token", validateAdmin); // validate admin token

// user routes  ("http://localhost:5001/api/user")
userRoutes.post("/login", userLogin); // user login
userRoutes.post("/register", userRegister); // user register
userRoutes.post("/validate-token",validateUser); // validate user token
userRoutes.post("/buy-car", addSoldVehicles); // add in owned vehicles
userRoutes.get("/my-vehicles", getMyCarsDetails); // all owned vehicles with dealer info
userRoutes.get("/my-vehicle/:car_id", getMyCarDetails); // every owned vehicle with info

// dealership routes ("http://localhost:5001/api/dealership")
dealershipRoutes.post("/login", dealershipLogin); // dealership login
dealershipRoutes.post("/register", dealershipRegister); // dealers register
dealershipRoutes.post("/validate-token", validateDealership); // validate dealership token
dealershipRoutes.post("/sell-car", addSoldVehicles); // sold vehicles me add
dealershipRoutes.get("/vehicles-for-sale/:dealership_id",allCarsForSaleAtDealership); // all sold vehicles with dealer info
dealershipRoutes.get("/vehicle-for-sale/:dealership_id/:car_id",carForSaleAtDealership); // every sold vehicle with info
dealershipRoutes.post("/deals/dealership=:dealership_name", postNewDeal); // add new deal
dealershipRoutes.post("/add-car", addNewCar); // adding cars by dealership

// general routes
generalRoutes.get("/cars", getAllCars); // view all cars
generalRoutes.get("/cars/dealership=:dealership_name", getCarByDealership); // view all cars by dealers
generalRoutes.get("/car/:car_id", getCarById); // about certain car
generalRoutes.get("/car/deals/:car_id", getDealsForCar); // deals on a certain car
generalRoutes.get("/deals", getAllDeals); // all deals
generalRoutes.get("/deals/dealership=:dealership_name",getAllDealsForASpecificDealer); // all deals by dealers

// returning an object of all routers
const routers = {
  adminRoutes,
  userRoutes,
  dealershipRoutes,
  generalRoutes,
};

export default routers;

// Implement a mechanism to invalidate JWT to facilitate logout and password change.
// Post requests should be able to handle multipart/form-data
// Implement asynchronous error handling using promises for all API endpoints. Handle and respond to any errors gracefully.
// Use ES6 compatible code i.e. use ES modules for import rather than common js import, use promises instead of callbacks etc.
// Provide basic Api documentation for your code.