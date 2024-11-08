// config/env.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

module.exports = {
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/qr-manager",
  PORT: process.env.PORT || 3000,
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
};
