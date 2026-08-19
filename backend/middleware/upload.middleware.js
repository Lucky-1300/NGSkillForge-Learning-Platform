// This file configures file uploads using Multer.
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads"));
    },

    filename: (req, file, cb) => {
        cb(
            null,
            `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`
        );
    },
});



const fileFilter = (req, file, cb) => {

    const allowedFileTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "video/mp4",
        "application/pdf",
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error("Invalid file type");
        error.status = 400;
        cb(error, false);
    }

};



const upload = multer({
    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});



module.exports = upload;