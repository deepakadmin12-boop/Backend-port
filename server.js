"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const servicesRoutes = require("./routes/servicesRoutes");
const enquiriesRoutes = require("./routes/enquiriesRoutes");
const projectsRoutes = require("./routes/projectsRoutes");

const app = express();

app.disable("x-powered-by");

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:8158/index.html",
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Uploaded project/profile images
app.use(
    "/uploads",
    express.static(
        path.resolve(process.env.UPLOAD_DIR || "uploads"),
        {
            dotfiles: "deny",
            index: false
        }
    )
);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "KEWADEV backend is running."
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", settingsRoutes);
app.use("/api", servicesRoutes);
app.use("/api", enquiriesRoutes);
app.use("/api", projectsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "API route not found."
    });
});

// Central error handler
app.use((error, req, res, next) => {
    console.error(error);

    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON request."
        });
    }

    if (error.name === "CastError") {
        return res.status(400).json({
            message: "Invalid ID."
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "This record already exists."
        });
    }

    if (error.name === "MulterError") {
        return res.status(400).json({
            message: error.code === "LIMIT_FILE_SIZE"
                ? "Image is too large."
                : "Image upload failed."
        });
    }

    if (
        error.message &&
        error.message.startsWith("Only JPG")
    ) {
        return res.status(400).json({
            message: error.message
        });
    }

    res.status(500).json({
        message: "Internal server error."
    });
});

// Start server only after database connects
const PORT = Number(process.env.PORT || 5000);

connectDB()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`KEWADEV API running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error("Backend startup failed:", error.message);
        process.exit(1);
    });