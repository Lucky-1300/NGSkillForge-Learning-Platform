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



router.post(
    "/refresh-token",
    refreshToken
); 



router.post(
    "/logout",
    logoutUser
);



module.exports = router;                                                                                                  