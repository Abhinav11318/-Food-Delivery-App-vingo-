// Backend/utils/db.js
import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGODB_URL || process.env.MONGO_URI || "mongodb://localhost:27017/Dishtra";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

export default connectDb;
