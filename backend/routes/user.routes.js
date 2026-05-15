const express = require("express");

const router = express.Router();

const {
    getProfile,
    getAllUsers,
    deleteUser,
} = require("../controllers/user.controller");

const authMiddleware = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");



router.get(
    "/profile",
    authMiddleware,
    getProfile
);



router.get(
    "/all-users",
    authMiddleware,
    roleMiddleware("admin"),
    getAllUsers
);



router.delete(
    "/delete-user/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
);



module.exports = router;