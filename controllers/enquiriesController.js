"use strict";

const Enquiry = require("../models/Enquiry");

async function getEnquiries(req, res, next) {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json({ enquiries });
    } catch (error) {
        next(error);
    }
}

async function createEnquiry(req, res, next) {
    try {
        const { name, email, message, subject } = req.body;

        if (
            !String(name || "").trim() ||
            !String(email || "").trim() ||
            !String(message || "").trim()
        ) {
            return res.status(400).json({
                message: "Name, email and message are required."
            });
        }

        const enquiry = await Enquiry.create({
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            subject: subject || "",
            message: String(message).trim()
        });

        res.status(201).json({
            message: "Enquiry submitted successfully.",
            enquiry
        });
    } catch (error) {
        next(error);
    }
}

async function updateEnquiry(req, res, next) {
    try {
        const allowedStatuses = ["new", "read", "replied", "archived"];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: "Invalid enquiry status."
            });
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!enquiry) {
            return res.status(404).json({
                message: "Enquiry not found."
            });
        }

        res.json({ message: "Enquiry updated.", enquiry });
    } catch (error) {
        next(error);
    }
}

async function deleteEnquiry(req, res, next) {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

        if (!enquiry) {
            return res.status(404).json({
                message: "Enquiry not found."
            });
        }

        res.json({ message: "Enquiry deleted." });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEnquiries,
    createEnquiry,
    updateEnquiry,
    deleteEnquiry
};