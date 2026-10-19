"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    login,
    logout,
    changePassword
} = require("../controllers/authController");

router.post("/login", login);
router.post("/logout", logout);
router.patch("/change-password", authMiddleware, changePassword);

module.exports = router;