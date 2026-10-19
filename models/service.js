"use strict";

const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    category: {
        type: String,
        default: "General",
        trim: true
    },
    icon: {
        type: String,
        default: "🛠️"
    },
    description: {
        type: String,
        default: "",
        maxlength: 3000
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Service", serviceSchema);