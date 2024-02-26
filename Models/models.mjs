// Table admin {
//   admin_id varchar [primary key]
//   password password_hash
// }

const adminSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["admin_id", "admin_email", "admin_password_hash"],
      properties: {
        admin_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        admin_email: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        admin_password_hash: {
          bsonType: "string",
          description: "must be a string and is required",
        },
      },
    },
  },
};

// Table user {
//   user_email varchar [primary key]
//   user_id varchar [note: 'randomly generated']
//   user_location varchar
//   user_info json [note: 'user private data']
//   password password_hash
//   vehicle_info list_of_id
// }

const userSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "user_email",
        "user_id",
        "user_location",
        "user_info",
        "user_password_hash",
        "vehicle_info"
      ],
      properties: {
        user_email: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        user_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        user_location: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        user_info: {
          bsonType: "object",
          description: "must be an object",
          properties: {
            name: {
              bsonType: "string",
              description: "must be a string",
            },
            mob_num: {
              bsonType: "string",
              description: "must be a string",
            },
            age: {
              bsonType: "int",
              description: "must be an integer",
            },
          },
        },
        user_password_hash: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        vehicle_info: {
          bsonType: "array",
          description: "must be an array",
        },
      },
    },
  },
};

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

const dealershipSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "dealership_email",
        "dealership_id",
        "dealership_name",
        "dealership_location",
        "dealership_password_hash",
        "dealership_info",
        "cars",
        "deals",
        "sold_vehicles"
      ],
      properties: {
        dealership_email: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        dealership_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        dealership_name: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        dealership_location: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        dealership_password_hash: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        dealership_info: {
          bsonType: "object",
          description: "must be an object",
          properties: {
            contact_num: {
              bsonType: "string",
              description: "must be a string",
            },
            rating: {
              bsonType: "double",
              description: "must be a double",
            },
          },
        },
        cars: {
          bsonType: "array",
          description: "must be an array",
        },
        deals: {
          bsonType: "array",
          description: "must be an array",
        },
        sold_vehicles: {
          bsonType: "array",
          description: "must be an array",
        },
      },
    },
  },
};

// Table deal {
//   deal_id varchar [primary key, note: 'randomly generated']
//   car_id varchar 
//   deal_info json [note: 'store additional fields']
// }

const dealSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["deal_id", "car_id", "deal_info"],
      properties: {
        deal_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        car_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        deal_info: {
          bsonType: "object",
          description: "must be an object",
          properties : {
            dicount : {
              bsonType : "string",
              description : "must be a string"
            },
            special_offers : {
              bsonType : "string",
              description : "must be a string"
            }
          }
        },
      },
    },
  },
};

// Table cars{
//   car_id varchar [primary key, note: 'randomly generated']
//   type varchar
//   name varchar
//   model varchar
//   car_info json [note: 'store additional fields']
// }

const carSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["car_id", "type", "name", "model", "car_info"],
      properties: {
        car_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        type: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        name: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        model: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        car_info: {
          bsonType: "object",
          description: "must be an object",
          properties: {
            model: {
              bsonType: "string",
              description: "must be a string",
            },
            launch_date: {
              bsonType: "date",
              description: "must be a date",
            },
            price: {
              bsonType: "int",
              description: "must be an integer",
            },
          },
        },
      },
    },
  },
};

// Table sold_vehicles{
//   vehicle_id varchar [primary key, note: 'randomly generated']
//   car_id varchar
//   vehicle_info json [note: 'store additional fields']
// }

const soldVehicleSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["vehicle_id", "car_id", "vehicle_info"],
      properties: {
        vehicle_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        car_id: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        vehicle_info: {
          bsonType: "object",
          description: "must be an object",
          properties: {
            type: {
              bsonType: "string",
              description: "must be a string",
            },
            name: {
              bsonType: "string",
              description: "must be a string",
            },
            model: {
              bsonType: "string",
              description: "must be a string",
            },
          },
        },
      },
    },
  },
};

export {
  adminSchema,
  userSchema,
  dealershipSchema,
  carSchema,
  dealSchema,
  soldVehicleSchema,
};
