"use strict";

const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    businessName: {
        type: String,
        default: "KEWA Software Development"
    },
    businessEmail: {
        type: String,
        default: ""
    },
    businessWebsite: {
        type: String,
        default: ""
    },
    businessCurrency: {
        type: String,
        default: "INR"
    },
    businessDescription: {
        type: String,
        default: ""
    },
    notifyEnquiries: {
        type: Boolean,
        default: true
    },
    notifyProjects: {
        type: Boolean,
        default: true
    },
    notifyServices: {
        type: Boolean,
        default: false
    },
    themePreference: {
        type: String,
        default: "dark"
    },
    languagePreference: {
        type: String,
        default: "en"
    },
    apiBaseUrl: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Setting", settingSchema);
