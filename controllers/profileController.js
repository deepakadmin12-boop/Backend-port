"use strict";

const fs = require("fs");
const path = require("path");
const Admin = require("../models/Admin");

function serializeAdmin(admin) {
    return {
        id: String(admin._id),
        name: admin.name,
        email: admin.email,
        photo: admin.photo || ""
    };
}

function removePhoto(photoPath) {
    if (!photoPath || !photoPath.startsWith("/uploads/")) return;

    const filePath = path.resolve(
        process.env.UPLOAD_DIR || "uploads",
        path.basename(photoPath)
    );

    fs.unlink(filePath, error => {
        if (error && error.code !== "ENOENT") {
            console.error("Could not remove profile photo:", error.message);
        }
    });
}

async function getProfile(req, res, next) {
    try {
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin account not found."
            });
        }

        res.json({ profile: serializeAdmin(admin) });
    } catch (error) {
        next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin account not found."
            });
        }

        if (req.body.name !== undefined) {
            const name = String(req.body.name).trim();

            if (!name) {
                return res.status(400).json({
                    message: "Name cannot be empty."
                });
            }

            admin.name = name;
        }

        if (req.body.email !== undefined) {
            const email = String(req.body.email).trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({
                    message: "Enter a valid email address."
                });
            }

            const existing = await Admin.findOne({
                email,
                _id: { $ne: admin._id }
            });

            if (existing) {
                return res.status(409).json({
                    message: "This email is already in use."
                });
            }

            admin.email = email;
        }

        await admin.save();

        res.json({
            message: "Profile updated successfully.",
            profile: serializeAdmin(admin)
        });
    } catch (error) {
        next(error);
    }
}

async function uploadPhoto(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Choose a profile photo first."
            });
        }

        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin account not found."
            });
        }

        const oldPhoto = admin.photo;
        admin.photo = `/uploads/${req.file.filename}`;

        await admin.save();
        removePhoto(oldPhoto);

        res.json({
            message: "Profile photo updated.",
            profile: serializeAdmin(admin)
        });
    } catch (error) {
        next(error);
    }
}

async function deletePhoto(req, res, next) {
    try {
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin account not found."
            });
        }

        const oldPhoto = admin.photo;
        admin.photo = "";

        await admin.save();
        removePhoto(oldPhoto);

        res.json({
            message: "Profile photo removed.",
            profile: serializeAdmin(admin)
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProfile,
    updateProfile,
    uploadPhoto,
    deletePhoto
};