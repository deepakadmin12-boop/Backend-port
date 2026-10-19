"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    getProjects,
    getPublicProjects,
    createProject,
    updateProject,
    deleteProject
} = require("../controllers/projectsController");

// Public portfolio endpoint
router.get("/public/projects", getPublicProjects);

// Protected admin endpoints
router.get("/projects", authMiddleware, getProjects);

router.post(
    "/projects",
    authMiddleware,
    upload.single("image"),
    createProject
);

router.put(
    "/projects/:id",
    authMiddleware,
    upload.single("image"),
    updateProject
);

router.delete(
    "/projects/:id",
    authMiddleware,
    deleteProject
);

module.exports = router;