import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies a CUSTOMER token and attaches the account to req.customer.
// This is intentionally a separate function from the admin `protect` in
// middleware/auth.js - the two token types are not interchangeable, so a
// customer's login can never be used to reach an admin-only route or vice
// versa, even by accident.
export const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please log in to continue" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await User.findById(decoded.id).select("-password");
    if (!customer) {
      return res.status(401).json({ message: "Account not found" });
    }
    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Please log in to continue" });
  }
};
