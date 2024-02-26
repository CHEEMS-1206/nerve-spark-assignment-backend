// admin.js
export class Admin {
  constructor(adminId, password) {
    this.admin_id = adminId;
    this.password = password;
  }
}

// user.js
export class User {
  constructor(
    userEmail,
    userId,
    userLocation,
    userInfo,
    passwordHash,
    vehicleInfo
  ) {
    this.user_email = userEmail;
    this.user_id = userId;
    this.user_location = userLocation;
    this.user_info = userInfo; // JSON data
    this.password_hash = passwordHash;
    this.vehicle_info = vehicleInfo; // Array of vehicle IDs
  }
}

// dealership.js
export class Dealership {
  constructor(
    dealershipEmail,
    dealershipId,
    dealershipName,
    dealershipLocation,
    passwordHash,
    dealershipInfo,
    cars,
    deals,
    soldVehicles
  ) {
    this.dealership_email = dealershipEmail;
    this.dealership_id = dealershipId;
    this.dealership_name = dealershipName;
    this.dealership_location = dealershipLocation;
    this.password_hash = passwordHash;
    this.dealership_info = dealershipInfo; // JSON data
    this.cars = cars; // Array of car IDs
    this.deals = deals; // Array of deal IDs
    this.sold_vehicles = soldVehicles; // Array of vehicle IDs
  }
}

// deal.js
export class Deal {
  constructor(dealId, carId, dealInfo) {
    this.deal_id = dealId;
    this.car_id = carId;
    this.deal_info = dealInfo; // JSON data
  }
}

// car.js
export class Car {
  constructor(carId, type, name, model, carInfo) {
    this.car_id = carId;
    this.type = type;
    this.name = name;
    this.model = model;
    this.car_info = carInfo; // JSON data
  }
}

// soldVehicle.js
export class SoldVehicle {
  constructor(vehicleId, carId, vehicleInfo) {
    this.vehicle_id = vehicleId;
    this.car_id = carId;
    this.vehicle_info = vehicleInfo; // JSON data
  }
}
