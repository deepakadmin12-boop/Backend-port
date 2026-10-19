"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getEnquiries,
    createEnquiry,
    updateEnquiry,
    deleteEnquiry
} = require("../controllers/enquiriesController");

// Public contact form
router.post("/public/enquiries", createEnquiry);

// Admin enquiry management
router.get("/enquiries", authMiddleware, getEnquiries);
router.patch("/enquiries/:id", authMiddleware, updateEnquiry);
router.delete("/enquiries/:id", authMiddleware, deleteEnquiry);

module.exports = router;