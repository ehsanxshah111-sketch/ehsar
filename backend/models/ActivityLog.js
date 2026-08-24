import mongoose from "mongoose";

// A simple audit trail of admin actions - who did what and when. Not meant
// to be a full undo history, just a readable log for "did I already do
// this" / "who changed that".
const activityLogSchema = new mongoose.Schema(
  {
    adminUsername: { type: String, required: true },
    action: { type: String, required: true }, // short label, e.g. "Product Updated"
    details: { type: String, default: "" }, // human-readable extra context
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
