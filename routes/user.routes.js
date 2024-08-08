const router = require("express").Router()
const { userProtected } = require("../middleware/protected")
const userController = require("./../controllers/user.controller")

router
    .post("/verify-user-email", userProtected, userController.verifyUserEmail)
    .post("/verify-user-email-otp", userProtected, userController.verifyEmailOTP)

    .post("/verify-user-mobile", userProtected, userController.verifyUserMobile)
    .post("/verify-user-mobile-otp", userProtected, userController.verifyMobileOTP)

    .post("/get-location", userProtected, userController.getLocation)
    .post("/add-post", userProtected, userController.addPost)
    .get("/posts", userController.getAllPosts)


module.exports = router