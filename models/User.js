const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dza1cv3fr/image/upload/v1721291420/avatar_qjjlfu.avif"
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
        // default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: Number,
        required: true
    },
    // location: {
    //     type: Number,
    //     required: true
    // },
}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)