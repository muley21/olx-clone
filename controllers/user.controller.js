const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
exports.verifyUserEmail = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailCode: `<h1>${otp}</h1>` })
    await sendEmail({ to: result.email, subject: "Verify Email", message: `Your Otp is ${otp}` })

    res.json({ message: "Verfiication Send Success" })
})
