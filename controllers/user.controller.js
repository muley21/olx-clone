const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const sendEmail = require("../utils/email")
const { sendSMS } = require("../utils/sms")
const Posts = require("../models/Posts")
const { checkEmpty } = require("../utils/checkEmpty")
const upload = require("../utils/upload")
const cloudinary = require("../utils/cloudinary.config")

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
    await User.findByIdAndUpdate(
        req.loggedInUser,
        { emailVerified: true },
        { new: true }
    )
    res.json({ message: "Email Verify Success" })
})

exports.verifyUserMobile = asyncHandler(async (req, res) => {
    const result = await User.findById(req.loggedInUser)
    // const { otp } = req.body
    const otp = Math.floor(10000 + Math.random() * 900000)
    await User.findByIdAndUpdate(req.loggedInUser, { mobileCode: otp })
    await sendSMS({
        message: `Welcome To SKILLHUB. Your OTP is ${otp}`,
        numbers: `${result.mobile}`
    })

    res.json({
        message: "Verfiication Send Success", result: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            avatar: updatedUser.avatar,
            emailVerified: updatedUser.emailVerified,
            mobileVerified: updatedUser.mobileVerified,
        }
    })
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
    const updatedUser = await User.findByIdAndUpdate(
        req.loggedInUser,
        { mobileVerified: true },
        { new: true })
    res.json({
        message: "mobile Verify Success", result: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            avatar: updatedUser.avatar,
            emailVerified: updatedUser.emailVerified,
            mobileVerified: updatedUser.mobileVerified,
        }
    })
})


exports.getLocation = asyncHandler(async (req, res) => {
    const { gps } = req.body
    const { isError, error } = checkEmpty({ gps })
    if (isError) {
        return res.status(400).json({ message: "All Fields Required", error })
    }

    // api call to openCageData
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPEN_CAGE_API_KEY}=${gps.latitude}+${gps.longitude}&pretty=1&no_annotations=1`)
    const x = await response.json()

    res.json({ message: "Location Fetch Success", result: x.results[0].formatted })

})
exports.addPost = asyncHandler(async (req, res) => {
    upload(req, res, async err => {


        const { title, desc, price, location, category } = req.body
        const { error, isError } = checkEmpty({ title, desc, price, location, category })
        if (isError) {
            return res.status(400).json({ message: "All Fields Required", error })
        }

        console.log(req.files)
        const images = []
        for (const item of req.files) {
            const { secure_url } = await cloudinary.uploader.upload(item.path)
            images.push(secure_url)
        }

        // modify this code to support cloudinary

        await Posts.create({ title, desc, price, images, location, category, user: req.loggedInUser })
        return res.json({ message: "Post Create Success" })
    })
})
exports.getAllPosts = asyncHandler(async (req, res) => {
    const result = await Posts.find()
    res.json({ message: "Post Get Success", result })
})