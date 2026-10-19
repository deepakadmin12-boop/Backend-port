"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getServices,
    createService,
    updateService,
    deleteService
} = require("../controllers/servicesController");

router.get("/services", authMiddleware, getServices);
router.post("/services", authMiddleware, createService);
router.put("/services/:id", authMiddleware, updateService);
router.delete("/services/:id", authMiddleware, deleteService);

module.exports = router;
