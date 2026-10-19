"use strict";

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        const token = req.cookies?.kewadev_token;

        if (!token) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.admin = {
            id: decoded.id
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Session invalid or expired. Please log in again."
        });
    }
}

module.exports = authMiddleware;