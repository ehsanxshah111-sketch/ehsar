import ActivityLog from "../models/ActivityLog.js";

// Fire-and-forget-ish: logging a failure should never break the real
// request (e.g. a product update shouldn't fail just because the log
// couldn't be written), so errors here are swallowed and just printed.
export const logActivity = async (adminUsername, action, details = "") => {
  try {
    await ActivityLog.create({ adminUsername: adminUsername || "unknown", action, details });
  } catch (err) {
    console.error("Failed to write activity log:", err.message);
  }
};
