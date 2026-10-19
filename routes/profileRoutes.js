"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    getProfile,
    updateProfile,
    uploadPhoto,
    deletePhoto
} = require("../controllers/profileController");

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.post(
    "/profile/photo",
    authMiddleware,
    upload.single("photo"),
    uploadPhoto
);

router.delete("/profile/photo", authMiddleware, deletePhoto);

module.exports = router;