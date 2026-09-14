import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    zernioApi: process.env.ZERNIO_API_KEY,
    geminiApi: process.env.GEMINI_API_KEY,
    imageKitApi: process.env.IMAGEKIT_PRIVATE_KEY,
    pollinationApi: process.env.POLLINATION_API_KEY
}