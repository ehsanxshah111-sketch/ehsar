import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

// This script ONLY touches the admins collection - it never deletes or
// modifies products, banners, orders, or anything else. Safe to run
// against your live production database whenever you need to create the
// first admin account or reset a forgotten password.
const run = async () => {
  await connectDB();

  const username = process.env.ADMIN_SEED_USERNAME || "admin";
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    console.error("Set ADMIN_SEED_PASSWORD before running this script.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ username });

  if (existing) {
    // Already exists - reset the password rather than creating a duplicate.
    existing.password = password; // Admin model hashes this on save
    await existing.save();
    console.log(`Existing admin "${username}" found - password has been reset.`);
  } else {
    await Admin.create({ username, password });
    console.log(`Admin "${username}" created.`);
  }

  console.log("Log in with:");
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
  console.log("Change this password from Account Settings after logging in.");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
