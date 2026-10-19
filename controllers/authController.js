"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 8 * 60 * 60 * 1000
    };
}

async function login(req, res, next) {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const admin = await Admin.findOne({ email }).select("+passwordHash");

        if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.cookie("kewadev_token", token, cookieOptions());

        res.json({
            message: "Login successful.",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        next(error);
    }
}

function logout(req, res) {
    res.clearCookie("kewadev_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.json({ message: "Logged out successfully." });
}

async function changePassword(req, res, next) {
    try {
        const currentPassword = String(req.body.currentPassword || "");
        const newPassword = String(req.body.newPassword || "");

        if (newPassword.length < 10) {
            return res.status(400).json({
                message: "New password must contain at least 10 characters."
            });
        }

        const admin = await Admin.findById(req.admin.id).select("+passwordHash");

        if (!admin) {
            return res.status(404).json({
                message: "Admin account not found."
            });
        }

        const valid = await bcrypt.compare(
            currentPassword,
            admin.passwordHash
        );

        if (!valid) {
            return res.status(400).json({
                message: "Current password is incorrect."
            });
        }

        admin.passwordHash = await bcrypt.hash(newPassword, 12);
        await admin.save();

        res.json({ message: "Password changed successfully." });
    } catch (error) {
        next(error);
    }
}

module.exports = { login, logout, changePassword };