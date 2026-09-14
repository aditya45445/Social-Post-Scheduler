import mongoose from "mongoose";
const accountScheman = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platform: {
        type: String,
        required: true,
        enum: ["twitter", "facebook", "instagram", "linkedin", "facebook_page", "linkedin_page", "instagram_business"]
    },
    handle: {
        type: String,
        unique: true,
        required: true
    },
    zernioAccountId: {
        type: String,
        unique: true,
        required: true
    },
    accessToken: {
        type: String,
        required: true,
        unique: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["connected", "disconnected"],
        default: "connected"
    },
    avatarUrl: {
        type: String
    }
}, {
    timestamps: true
})

const accountModel = mongoose.model("Account", accountScheman)

export default accountModel