
"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    register,
    login,
    logout,
    changePassword
} = require("../controllers/authController");

// Admin authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected route
router.patch(
    "/change-password",
    authMiddleware,
    changePassword
);

module.exports = router;
