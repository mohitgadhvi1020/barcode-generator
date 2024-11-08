const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    // Get credentials from environment variables
    const username = encodeURIComponent(process.env.MONGO_USERNAME);
    const password = encodeURIComponent(process.env.MONGO_PASSWORD);
    const cluster = process.env.MONGO_CLUSTER;
    const dbName = process.env.MONGO_DB_NAME;

    // Construct connection string
    const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;

    // Connect with mongoose
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log("Database connection tested successfully!");

    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);

    // More detailed error logging
    if (error.code === 8000) {
      console.error(
        "Authentication failed - Please check your username and password"
      );
    } else if (error.code === "ENOTFOUND") {
      console.error(
        "Could not reach the database - Please check your connection and cluster name"
      );
    }

    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
