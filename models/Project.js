"use strict";

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 5000
        },

        category: {
            type: String,
            default: "General",
            trim: true,
            maxlength: 100
        },

        image: {
            type: String,
            default: ""
        },

        projectUrl: {
            type: String,
            default: "",
            trim: true
        },

        technologies: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);
