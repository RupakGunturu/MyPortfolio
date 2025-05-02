import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
let db;

export const connectToDB = async (cb) => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    db = client.db();      // uses DB from URI
    console.log("✅ MongoDB connected");
    cb();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export { db };
