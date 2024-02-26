import express from "express";

import {
  userLogin,
  userRegister,
  getAllCars,
  getCarById,
  getCarByDealership,
  getCarsByUser,
  getCarByUser,
  getDealsForCar
} from "../Controllers/UserController.mjs";
import { adminRegister, adminLogin } from "../controllers/adminController.mjs";
import {
  dealershipRegister,
  dealershipLogin,
  allCarsForSaleAtDealership,
  carForSaleAtDealership,
  getAllDeals,
  getAllDealsForASpecificDealer,
  postNewDeal
} from "../Controllers/DealerShipController.mjs";

const adminRouter = express.Router();
const userRoutes = express.Router();
const dealershipRoutes = express.Router();

// admin routes ("http://localhost:5001/api/admin)

adminRouter.post("/login", adminLogin); // login admin
adminRouter.post("/register", adminRegister); // register admin

// user routes  ("http://localhost:5001/api/user")
userRoutes.post("/login", userLogin); // user login
userRoutes.post("/register", userRegister); // user register
userRoutes.get("/cars", getAllCars); // view all cars
userRoutes.get("/cars/dealership=:dealership_name", getCarByDealership); // view all cars by dealers
userRoutes.get("/car/:car_id", getCarById); // about certain car
userRoutes.get("/car/deals/:car_id", getDealsForCar); // deals on a certain car
userRoutes.post("/buy-car"); // add in owned vehicles
userRoutes.get("/my-vehicles/:user_id", getCarsByUser); // all owned vehicles with dealer info
userRoutes.get("/my-vehicle/:user_id/:car_id", getCarByUser); // every owned vehicle with info
userRoutes.get("/deals",getAllDeals); // all deals
userRoutes.get("/deals/dealership=:dealership_name",getAllDealsForASpecificDealer); // all deals by dealers

// dealership routes ("http://localhost:5001/api/dealership")

dealershipRoutes.post("/login", dealershipLogin); // dealership login
dealershipRoutes.post("/register", dealershipRegister); // dealers register
dealershipRoutes.get("/cars", getAllCars); // view all cars
dealershipRoutes.get("/car/:car_id", getCarById); // about certain car
dealershipRoutes.get("/cars/dealership=:dealership_name", getCarByDealership); // view all cars by dealers
dealershipRoutes.post("/sell-car"); // sold vehicles me add
dealershipRoutes.get("/my-vehicles/:dealership_id", allCarsForSaleAtDealership); // all sold vehicles with dealer info
dealershipRoutes.get("/my-vehicle/:dealership_id/:car_id", carForSaleAtDealership); // every sold vehicle with info
dealershipRoutes.get("/deals",getAllDeals); // all deals
dealershipRoutes.get("/deals/dealership=:dealership_name",getAllDealsForASpecificDealer); // by dealers
dealershipRoutes.post("/deals/dealership=:dealership_name", postNewDeal); // add new deal

// returning an object of all routers
const routers = {
  adminRouter,
  userRoutes,
  dealershipRoutes,
};

export default routers;

// Implement a mechanism to invalidate JWT to facilitate logout and password change.
// Post requests should be able to handle multipart/form-data
// Implement asynchronous error handling using promises for all API endpoints. Handle and respond to any errors gracefully.
// Use ES6 compatible code i.e. use ES modules for import rather than common js import, use promises instead of callbacks etc.
// Provide basic Api documentation for your code.
