const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI is not configured in environment variables.");
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error("[MongoDB] Connection error:", err.message);
    return false;
  }
}

module.exports = connectDB;
