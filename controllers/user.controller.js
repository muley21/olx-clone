const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
exports.verifyUserEmail = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailCode: otp })
    await sendEmail({ to: result.email, subject: "Verify Email", message: otp })

    res.json({ message: "Verication Send Success" })
})
