// app.js
const express = require("express");
const path = require("path");
const config = require("./config/env");
const connectDB = require("./config/database");
const qrRoutes = require("./routes/qrRoutes");

const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - API routes first
app.use("/", qrRoutes);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Serve dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
