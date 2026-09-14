import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true, 'email must be unique'],
        trim: true,
        lowerCase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'please provide a valid email address']

    },
    username: {
        type: String,
        required: [true, 'username is required'],
        unique: [true, 'username is unique'],
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minLenght: [8, 'password must be at least 8 characters long']
    },
    zernioProfileId: {
        type: String,
    }
}, {
    timestamps: true
})

const userModel = mongoose.model('user', userSchema)


export default userModel