
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

// REGISTER ADMIN
async function register(req, res, next) {
    try {
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();
        const inviteCode = String(req.body.inviteCode || "");
        const password = String(req.body.password || "");

        if (!name || !email || !inviteCode || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                message: "Name is too long."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Enter a valid email address."
            });
        }

        if (password.length < 10) {
            return res.status(400).json({
                message: "Password must contain at least 10 characters."
            });
        }

        const configuredInviteCode =
            process.env.ADMIN_INVITE_CODE;

        if (!configuredInviteCode) {
            return res.status(503).json({
                message: "Admin registration is not configured."
            });
        }

        if (inviteCode !== configuredInviteCode) {
            return res.status(403).json({
                message: "Invalid invite code."
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const admin = await Admin.create({
            name,
            email,
            passwordHash
        });

        return res.status(201).json({
            message: "Admin account created successfully.",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        next(error);
    }
}

// LOGIN ADMIN
async function login(req, res, next) {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();
        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const admin = await Admin.findOne({ email })
            .select("+passwordHash");

        if (
            !admin ||
            !(await bcrypt.compare(password, admin.passwordHash))
        ) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Authentication is not configured."
            });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.cookie("kewadev_token", token, cookieOptions());

        return res.json({
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

// LOGOUT ADMIN
function logout(req, res) {
    res.clearCookie("kewadev_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    return res.json({
        message: "Logged out successfully."
    });
}

// CHANGE PASSWORD
async function changePassword(req, res, next) {
    try {
        const currentPassword =
            String(req.body.currentPassword || "");
        const newPassword =
            String(req.body.newPassword || "");

        if (newPassword.length < 10) {
            return res.status(400).json({
                message: "New password must contain at least 10 characters."
            });
        }

        const admin = await Admin.findById(req.admin.id)
            .select("+passwordHash");

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

        return res.json({
            message: "Password changed successfully."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    logout,
    changePassword
};
