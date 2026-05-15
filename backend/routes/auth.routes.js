const express = require("express");

const router = express.Router();

const {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
} = require("../controllers/auth.controller");

const {
    validateRegister,
    validateLogin,
} = require("../middleware/validation.middleware");



router.post(
    "/send-otp",
    sendOtp
);



router.post(
    "/verify-otp",
    verifyOtp
);



router.post(
    "/register",
    validateRegister,
    registerUser
);



router.post(
    "/login",
    validateLogin,
    loginUser
);



module.exports = router;