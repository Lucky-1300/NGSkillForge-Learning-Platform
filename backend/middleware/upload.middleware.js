const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + "-" + file.originalname
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
        cb(
            new Error("Invalid file type"),
            false
        );
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