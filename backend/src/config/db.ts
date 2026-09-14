// src/config/db.ts
import mongoose from "mongoose";
import { config } from "./config.ts"


export async function connectDb(): Promise<void> {
    try {
        if (!config.mongoURI) {
            throw new Error(" MONGO_URI is not defined in .env");
        }
        await mongoose.connect(config.mongoURI as string)
            .then(() => {
                console.log("MongoDB connected successfully");
            })
    } catch (error) {
        console.error(" MongoDB connection error:", (error as Error).message);
        process.exit(1);
    }
}
