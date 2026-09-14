import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platform: {
        type: String
    },
    actionType: {
        type: String,
        enum: ["POST_PUBLISHED", "AI_REPLY"],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    relatedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    aiGeneratedText: {
        type: String
    }

}, {
    timestamps: true
})

const activityLogModel = mongoose.model("activityLog", activityLogSchema)

export default activityLogModel