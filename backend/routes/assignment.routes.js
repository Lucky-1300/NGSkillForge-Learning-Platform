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
const { validateObjectId, validateAssignment } = require("../middleware/validation.middleware");



router.post(
    "/upload-assignment",
    authMiddleware,
    roleMiddleware("admin"),
    upload.single("file"),
    validateAssignment,
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
    validateObjectId(),
    getSingleAssignment
);



router.delete(
    "/delete-assignment/:id",
    authMiddleware,
    roleMiddleware("admin"),
    validateObjectId(),
    deleteAssignment
);



module.exports = router;