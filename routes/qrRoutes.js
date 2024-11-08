// routes/qrRoutes.js
const express = require("express");
const router = express.Router();
const QRController = require("../controllers/qrController");

// Redirect route should be first
router.get("/r/:id", QRController.handleRedirect);

// API routes
router.post("/generate-dynamic-qr", QRController.generateQR);
router.put("/update-url/:id", QRController.updateUrl); // This was causing the error
router.get("/qr-codes", QRController.getAllQRCodes);
router.delete("/qr-code/:id", QRController.deleteQRCode);
router.delete("/qr-codes", QRController.deleteAllQRCodes);

module.exports = router;
