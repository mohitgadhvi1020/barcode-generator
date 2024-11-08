// controllers/qrController.js
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const QRCodeModel = require("../models/QRCode");

class QRController {
  static async generateQR(req, res) {
    try {
      const { url, name, id } = req.body;

      if (!url || !name) {
        return res.status(400).json({ error: "URL and name are required" });
      }

      try {
        new URL(url);
      } catch (err) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      const qrId = id || uuidv4();
      const redirectUrl = `${process.env.BASE_URL}/r/${qrId}`;

      const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl);

      if (!id) {
        const newQRCode = new QRCodeModel({
          id: qrId,
          name,
          destinationUrl: url,
          redirectUrl,
        });
        await newQRCode.save();
      }

      res.json({
        success: true,
        qrCode: qrCodeDataUrl,
        id: qrId,
        name,
        redirectUrl,
        destinationUrl: url,
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  }

  static async handleRedirect(req, res) {
    try {
      const { id } = req.params;
      const qrCode = await QRCodeModel.findOne({ id });

      if (!qrCode) {
        return res.status(404).send("QR code not found");
      }

      qrCode.scans.push({
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      await qrCode.save();

      res.redirect(qrCode.destinationUrl);
    } catch (error) {
      console.error("Error handling redirect:", error);
      res.status(500).send("Server error");
    }
  }

  static async updateUrl(req, res) {
    // This method was missing or incorrect
    try {
      const { id } = req.params;
      const { newUrl } = req.body;

      if (!newUrl) {
        return res.status(400).json({ error: "New URL is required" });
      }

      try {
        new URL(newUrl);
      } catch (err) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      const qrCode = await QRCodeModel.findOne({ id });

      if (!qrCode) {
        return res.status(404).json({ error: "QR code not found" });
      }

      qrCode.destinationUrl = newUrl;
      await qrCode.save();

      res.json({
        success: true,
        id,
        newUrl,
      });
    } catch (error) {
      console.error("Error updating URL:", error);
      res.status(500).json({ error: "Failed to update URL" });
    }
  }

  static async getAllQRCodes(req, res) {
    try {
      const qrCodes = await QRCodeModel.find().sort({ createdAt: -1 });
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ error: "Failed to fetch QR codes" });
    }
  }

  static async deleteQRCode(req, res) {
    try {
      const { id } = req.params;
      await QRCodeModel.findOneAndDelete({ id });
      res.json({ success: true, message: "QR code deleted successfully" });
    } catch (error) {
      console.error("Error deleting QR code:", error);
      res.status(500).json({ error: "Failed to delete QR code" });
    }
  }

  static async deleteAllQRCodes(req, res) {
    try {
      await QRCodeModel.deleteMany({});
      res.json({ success: true, message: "All QR codes deleted successfully" });
    } catch (error) {
      console.error("Error deleting QR codes:", error);
      res.status(500).json({ error: "Failed to delete QR codes" });
    }
  }
}

module.exports = QRController;
