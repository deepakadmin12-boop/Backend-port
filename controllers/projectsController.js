"use strict";

const fs = require("fs");
const path = require("path");
const Project = require("../models/Project");

function getProjectData(body) {
    const title = String(body.title || body.name || "").trim();

    const description = String(body.description || "").trim();
    const category = String(body.category || "General").trim();
    const projectUrl = String(body.projectUrl || body.liveUrl || "").trim();

    let technologies = body.technologies || [];

    if (typeof technologies === "string") {
        try {
            technologies = JSON.parse(technologies);
        } catch {
            technologies = technologies
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);
        }
    }

    if (!Array.isArray(technologies)) {
        technologies = [];
    }

    const status =
        String(body.status || "draft").toLowerCase() === "published" ||
        String(body.status || "").toLowerCase() === "active"
            ? "published"
            : "draft";

    return {
        title,
        description,
        category,
        projectUrl,
        technologies: technologies.map(String),
        status
    };
}

function serializeProject(project) {
    const item = project.toObject ? project.toObject() : project;

    return {
        ...item,
        id: String(item._id),
        name: item.title,
        imageUrl: item.image
    };
}

function removeUploadedImage(imagePath) {
    if (!imagePath || !imagePath.startsWith("/uploads/")) return;

    const filename = path.basename(imagePath);
    const filePath = path.resolve(
        process.env.UPLOAD_DIR || "uploads",
        filename
    );

    fs.unlink(filePath, error => {
        if (error && error.code !== "ENOENT") {
            console.error("Could not delete image:", error.message);
        }
    });
}

// GET /api/projects — Admin: all projects
async function getProjects(req, res, next) {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });

        res.json({
            projects: projects.map(serializeProject)
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/public/projects — Public: published projects only
async function getPublicProjects(req, res, next) {
    try {
        const projects = await Project.find({
            status: "published"
        }).sort({ createdAt: -1 });

        res.json({
            projects: projects.map(serializeProject)
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/projects — Create project
async function createProject(req, res, next) {
    try {
        const data = getProjectData(req.body);

        if (!data.title) {
            return res.status(400).json({
                message: "Project title is required."
            });
        }

        if (req.file) {
            data.image = `/uploads/${req.file.filename}`;
        }

        const project = await Project.create(data);

        res.status(201).json({
            message: "Project created successfully.",
            project: serializeProject(project)
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/projects/:id — Update project
async function updateProject(req, res, next) {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        const data = getProjectData(req.body);

        if (!data.title) {
            return res.status(400).json({
                message: "Project title is required."
            });
        }

        project.title = data.title;
        project.description = data.description;
        project.category = data.category;
        project.projectUrl = data.projectUrl;
        project.technologies = data.technologies;
        project.status = data.status;

        if (req.file) {
            const oldImage = project.image;
            project.image = `/uploads/${req.file.filename}`;
            removeUploadedImage(oldImage);
        }

        await project.save();

        res.json({
            message: "Project updated successfully.",
            project: serializeProject(project)
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/projects/:id — Delete project
async function deleteProject(req, res, next) {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        const oldImage = project.image;

        await project.deleteOne();
        removeUploadedImage(oldImage);

        res.json({
            message: "Project deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProjects,
    getPublicProjects,
    createProject,
    updateProject,
    deleteProject
};