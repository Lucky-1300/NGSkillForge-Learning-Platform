// This file contains all auth API routes.
const express = require("express");

const router = express.Router();

const {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
} = require("../controllers/auth.controller");

const {
    validateRegister,
    validateLogin,
    validateOtpRequest,
    validateOtpVerification,
    validateRefreshToken,
} = require("../middleware/validation.middleware");



router.post(
    "/send-otp",
    validateOtpRequest,
    sendOtp
);



router.post(
    "/verify-otp",
    validateOtpVerification,
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



router.post(
    "/refresh-token",
    validateRefreshToken,
    refreshToken
); 



router.post(
    "/logout",
    logoutUser
);



module.exports = router;                                                                                                  