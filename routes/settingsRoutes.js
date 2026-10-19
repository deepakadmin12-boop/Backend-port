"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    getSettings,
    updateSettings
} = require("../controllers/settingsController");

router.get("/settings", authMiddleware, getSettings);
router.put("/settings", authMiddleware, updateSettings);

module.exports = router;