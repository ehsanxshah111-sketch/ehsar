import express from "express";
import PaymentSettings from "../models/PaymentSettings.js";
import { protect } from "../middleware/auth.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

const getOrCreateSettings = async () => {
  let settings = await PaymentSettings.findOne({ singleton: "payment" });
  if (!settings) {
    settings = await PaymentSettings.create({ singleton: "payment" });
  }
  return settings;
};

// GET /api/settings/payment (public) - checkout page needs these to show
// the customer where to send JazzCash/Easypaisa/bank transfer payments
router.get("/payment", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/settings/payment (admin only) - edit the account numbers shown
router.put("/payment", protect, async (req, res) => {
  try {
    const { jazzCash, easypaisa, bankTransfer } = req.body;
    const settings = await getOrCreateSettings();
    if (jazzCash) settings.jazzCash = { ...settings.jazzCash.toObject(), ...jazzCash };
    if (easypaisa) settings.easypaisa = { ...settings.easypaisa.toObject(), ...easypaisa };
    if (bankTransfer) settings.bankTransfer = { ...settings.bankTransfer.toObject(), ...bankTransfer };
    await settings.save();
    await logActivity(req.admin.username, "Payment Settings Updated", `${req.admin.username} updated payment account details`);
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: "Failed to update payment settings", error: err.message });
  }
});

export default router;
