// admin register
// admin verify otp
// admin login
// admin logout

// user register
// user login
// user verify email
// user logout

const asyncHandler = require("express-async-handler")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { checkEmpty } = require("../utils/checkEmpty")
const Admin = require("../models/Admin")
const User = require("../models/User")
const sendEmail = require("../utils/email")

exports.registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const { isError, error } = checkEmpty({ name, email, password })
    if (isError) {
        res.json({ message: "All Fields Required", error })
    }
    if (!validator.isEmail(email)) {
        return res.json({ message: "Invalid Email" })
    }
    // if (!validator.isStrongPassword(password)) {
    //     return res.json({ message: "Provide Strong Password" })
    // }
    const isFound = await Admin.findOne({ email })
    if (isFound) {
        return res.status(400).json({ message: "Email Already Registered With Us" })
    }
    const hash = await bcrypt.hash(password, 10)
    await Admin.create({ name, email, password: hash })
    res.json({ message: "Register Success" })
})

exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const { isError, error } = checkEmpty({ email, password })
    if (isError) {
        return res.status(401).json({ message: "All Feild Required", error })
    }
    if (!validator.isEmail(email)) {
        return res.status(401).json({ message: "Invalid Email" })
    }
    const result = await Admin.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: " Email Not Found" })
    }
    const isVerify = await bcrypt.compare(password, result.password)
    if (!isVerify) {
        return res.status(401).json({ message: process.env.NODE_ENV === "development" ? "Invalid password" : "Invalid Credential" })
    }

    // Send OTP
    const otp = Math.floor(10000 + Math.random() * 900000) //nanoid

    await Admin.findByIdAndUpdate(result._id, { otp })

    await sendEmail({
        to: email, subject: `Login OTP`, message: `
        <h1>Do Not Share Your Otp</h1>
        <p>Your login otp is ${otp}</p>
        `})

    res.json({ message: "Credentials Verify Success. OTP Send To Your Registered email. " })
})
exports.verifyOTP = asyncHandler(async (req, res) => {
    const { otp, email } = req.body
    const { isError, error } = checkEmpty({ otp, email })
    if (isError) {
        res.json({ message: "All Fields Required", error })
    }
    if (!validator.isEmail(email)) {
        return res.status(401).json({ message: "Invalid Email" })
    }
    const result = await Admin.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: process.env.NODE_ENV === "development" ? "Invalid Email" : "Invalid Crediantials" })
    }

    if (otp !== result.otp) {
        return res.status(401).json({ message: "Invalid OTP" })

    }
    // JWT
    const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY, { expiresIn: "1d" })
    // Coockie
    res.cookie("admin", token, {
        maxAge: 86400000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    })
    // Res
    res.json({
        message: "OTP Verify Success", result: {
            _id: result._id,
            name: result.name,
            email: result.email,
        }
    })

})

exports.logoutAdmin = asyncHandler(async (req, res) => {
    res.clearCookie("admin")
    res.json({ message: "Admin Logout success" })
})

exports.registerUser = asyncHandler(async (req, res) => {
    const { name, mobile, email, password, cpassword } = req.body
    const { error, isError } = checkEmpty({
        name, mobile, email, password, cpassword
    })
    if (isError) {
        return res.status(400).json({ message: "All Fields Require", error })
    }
    if (!validator.isEmail(email)) { return res.status(400).json({ message: "Invalid Email" }) }
    if (!validator.isMobilePhone(mobile, "en-IN")) { return res.status(400).json({ message: "Invalid Mobile" }) }
    if (!validator.isStrongPassword(password)) { return res.status(400).json({ message: "Provide Strong Password" }) }
    if (!validator.isStrongPassword(cpassword)) { return res.status(400).json({ message: "Provide Confirm Strong Password" }) }
    if (password !== cpassword) { return res.status(400).json({ message: "Password Do not match" }) }

    const result = await User.findOne({ email })
    if (result) {
        res.status(404).json({ message: "Email Already Registerd" })
    }

    const hash = await bcrypt.hash(password, 10)

    await User.create({ name, mobile, email, password: hash })

    res.json({ message: "User Register Success" })
})

exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const { error, isError } = checkEmpty({
        email, password
    })
    if (isError) {
        return res.status(400).json({ message: "All Fields Require", error })
    }

    const result = await User.findOne({ email })
    if (!result) {
        return res.status(401).json({ message: "Email Not Found" })
    }
    const verify = await bcrypt.compare(password)
    if (!verify) {
        return res.status(401).json({ message: "Password Do Not Match" })

    }

    const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY, { expiresIn: "180d" })

    res.cookie("user", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 180
    })
    res.json({ message: "User Login Success" })
})

exports.logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("User")
    res.json({ message: "User Logout success" })
})

