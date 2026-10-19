"use strict";

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.resolve(
    process.env.UPLOAD_DIR || "uploads"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadDirectory);
    },

    filename: function (req, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase();

        callback(
            null,
            `${Date.now()}-${require("crypto").randomBytes(8).toString("hex")}${extension}`
        );
    }
});

function fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
        return callback(
            new Error("Only JPG, PNG, WEBP, and GIF images are allowed.")
        );
    }

    callback(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize:
            Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024,
        files: 1
    }
});

module.exports = upload;