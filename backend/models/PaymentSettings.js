import mongoose from "mongoose";

// Only ever one document - it holds the account details customers see at
// checkout for JazzCash, Easypaisa and Bank Transfer. Editable from the
// admin panel so nothing needs a code change/redeploy to update.
const paymentSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "payment", unique: true },
    jazzCash: {
      accountTitle: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      instructions: { type: String, default: "" },
    },
    easypaisa: {
      accountTitle: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      instructions: { type: String, default: "" },
    },
    bankTransfer: {
      accountTitle: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      bankName: { type: String, default: "" },
      instructions: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentSettings", paymentSettingsSchema);
