import { connect } from "mongoose";
const dbConnect = async () => {
  try {
    await connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // You want to "Fail Fast" on connection error to signal process managers like Docker or PM2 that there is a critical error
  }
}

export default dbConnect;