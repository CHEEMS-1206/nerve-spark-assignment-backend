import mongodb from "mongodb";

// Get MongoDB client
const MongoClient = mongodb.MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri);

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

// get all deals
export const getAllDeals = async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const dealsCollection = database.collection("deals");

    const allDeals = await dealsCollection.find({}).toArray();

    res.status(200).json(allDeals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all deals for a specific dealer
export const getAllDealsForASpecificDealer = async (req, res) => {
  try {
    const { dealership_name } = req.params;

    const database = client.db(process.env.DB_NAME);
    const dealershipsCollection = database.collection("dealerships");
    const dealsCollection = database.collection("deals");

    // Case-insensitive search for the dealer by name
    const dealer = await dealershipsCollection.findOne({
      dealership_name: { $regex: new RegExp(dealership_name, "i") },
    });

    if (!dealer) {
      return res.status(404).json({ error: "Dealer not found" });
    }

    // Fetch all deals associated with the dealer
    const dealerDeals = await dealsCollection
      .find({ deal_id: { $in: dealer.deals } })
      .toArray();

    res.status(200).json(dealerDeals)
  } catch (error) {
    console.error("Error fetching deals for dealer:", error);
    res.status(500).json({ error: "Internal server error" });
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