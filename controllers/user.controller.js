const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
exports.verifyUserEmail = asyncHandler(async (req, res) => {
    console.log(req.loggedInUser)
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailCode: otp })
    await sendEmail({ to: result.email, subject: "Verify Email", message: `Your Otp is ${otp}` })

    res.json({ message: "Verfiication Send Success" })
})

exports.verifyEmailOTP = asyncHandler(async (req, res) => {

    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (otp !== result.emailCode) {
        return res.status(400).json({ message: "Inavlid Otp" })
    }
    await User.findByIdAndUpdate(req.loggedInUser, { emailVerified: true })
    res.json({ message: "Email Verify Success" })
})
