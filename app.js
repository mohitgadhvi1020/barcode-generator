require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/database");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/qrRoutes"));

// Connect to MongoDB with retries
const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(
      "Failed to connect to MongoDB, retrying in 5 seconds...",
      err
    );
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
