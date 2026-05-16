// This file contains assignment API routes.
const express = require("express");

const router = express.Router();

const {
    uploadAssignment,
    getAllAssignments,
    getSingleAssignment,
    deleteAssignment,
} = require("../controllers/assignment.controller");

const authMiddleware = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");

const upload = require("../middleware/upload.middleware");



router.post(
    "/upload-assignment",
    authMiddleware,
    roleMiddleware("admin"),
    upload.single("file"),
    uploadAssignment
);



router.get(
    "/all-assignments",
    authMiddleware,
    getAllAssignments
);



router.get(
    "/single-assignment/:id",
    authMiddleware,
    getSingleAssignment
);



router.delete(
    "/delete-assignment/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteAssignment
);



module.exports = router;