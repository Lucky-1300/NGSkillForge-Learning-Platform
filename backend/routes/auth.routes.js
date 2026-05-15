const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
} = require("../controllers/auth.controllers");

const {
    validateRegister,
    validateLogin,
} = require("../middleware/validation.middleware");

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