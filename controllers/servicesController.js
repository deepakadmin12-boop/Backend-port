"use strict";

const Service = require("../models/Service");

async function getServices(req, res, next) {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json({ services });
    } catch (error) {
        next(error);
    }
}

async function createService(req, res, next) {
    try {
        const { name, category, icon, description } = req.body;

        if (!String(name || "").trim()) {
            return res.status(400).json({
                message: "Service name is required."
            });
        }

        const service = await Service.create({
            name: String(name).trim(),
            category: category || "General",
            icon: icon || "🛠️",
            description: description || "",
            status: req.body.status === "Inactive" ? "Inactive" : "Active"
        });

        res.status(201).json({
            message: "Service created.",
            service
        });
    } catch (error) {
        next(error);
    }
}

async function updateService(req, res, next) {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                category: req.body.category,
                icon: req.body.icon,
                description: req.body.description,
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!service) {
            return res.status(404).json({
                message: "Service not found."
            });
        }

        res.json({ message: "Service updated.", service });
    } catch (error) {
        next(error);
    }
}

async function deleteService(req, res, next) {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found."
            });
        }

        res.json({ message: "Service deleted." });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getServices,
    createService,
    updateService,
    deleteService
};