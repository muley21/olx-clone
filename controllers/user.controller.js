const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
const { sendSMS } = require("../utils/sms")

exports.verifyUserEmail = asyncHandler(async (req, res) => {
    console.log(req.loggedInUser)
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You Are Not Logged In..Please Login Again" })
    }
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { emailCode: otp })
    await sendEmail({ to: result.email, subject: "Verify Email", message: `Your Otp is ${otp}` })

    res.json({ message: "Verfiication Send Success" })
})

exports.verifyEmailOTP = asyncHandler(async (req, res) => {

    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You Are Not Logged In..Please Login Again" })
    }
    if (otp !== result.emailCode) {
        return res.status(400).json({ message: "Inavlid Otp" })
    }
    await User.findByIdAndUpdate(req.loggedInUser, { emailVerified: true })
    res.json({ message: "Email Verify Success" })
})

exports.verifyUserMobile = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { mobileCode: otp })
    await sendSMS({
        message: `Welcome To SKILLHUB. Your OTP is ${otp}`,
        numbers: `${result.mobile}`
    })

    res.json({ message: "Verfiication Send Success" })
})
exports.verifyMobileOTP = asyncHandler(async (req, res) => {

    const { otp } = req.body
    const result = await User.findById(req.loggedInUser)
    if (!result) {
        return res.status(401).json({ message: "You Are Not Logged In..Please Login Again" })
    }
    if (otp != result.mobileCode) {
        return res.status(400).json({ message: "Inavlid Otp" })
    }
    await User.findByIdAndUpdate(req.loggedInUser, { mobileVerified: true })
    res.json({ message: "mobile Verify Success" })
})
