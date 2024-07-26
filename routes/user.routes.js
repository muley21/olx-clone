const router = require("express").Router()
const { userProtected } = require("../middleware/protected")
const userController = require("./../controllers/user.controller")

router
    .post("/verify-user-email", userProtected, userController.verifyUserEmail)

module.exports = router