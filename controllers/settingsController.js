"use strict";

const Setting = require("../models/Setting");

async function getSettings(req, res, next) {
    try {
        let settings = await Setting.findOne();

        if (!settings) {
            settings = await Setting.create({});
        }

        res.json({ settings });
    } catch (error) {
        next(error);
    }
}

async function updateSettings(req, res, next) {
    try {
        const allowedFields = [
            "businessName",
            "businessEmail",
            "businessWebsite",
            "businessCurrency",
            "businessDescription",
            "notifyEnquiries",
            "notifyProjects",
            "notifyServices",
            "themePreference",
            "languagePreference",
            "apiBaseUrl"
        ];

        const update = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                update[field] = req.body[field];
            }
        }

        if (
            update.businessName !== undefined &&
            !String(update.businessName).trim()
        ) {
            return res.status(400).json({
                message: "Business name is required."
            });
        }

        const settings = await Setting.findOneAndUpdate(
            {},
            { $set: update },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.json({
            message: "Settings saved successfully.",
            settings
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getSettings, updateSettings };