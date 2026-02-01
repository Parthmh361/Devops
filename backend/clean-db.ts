#!/usr/bin/env node

/**
 * CLEAR TEST DATABASE
 * Removes test users from MongoDB
 * Run: npx ts-node clean-db.ts
 */

import mongoose from "mongoose";
import User from "./src/models/User.model";
import dotenv from "dotenv";

dotenv.config();

async function cleanDatabase() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/event-sponsorship"
    );

    console.log("🗑️  Deleting test users...");
    const result = await User.deleteMany({
      email: {
        $in: [
          "sarah@techconf.com",
          "alex@brandtech.com",
          "nonexistent@example.com",
        ],
      },
    });

    console.log(`✅ Deleted ${result.deletedCount} test user(s)`);

    const count = await User.countDocuments();
    console.log(`📊 Total users in database: ${count}`);

    await mongoose.disconnect();
    console.log("✅ Database cleaned successfully!");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

cleanDatabase();
