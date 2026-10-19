"use strict";

const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        default: "",
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    status: {
        type: String,
        enum: ["new", "read", "replied", "archived"],
        default: "new"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Enquiry", enquirySchema);