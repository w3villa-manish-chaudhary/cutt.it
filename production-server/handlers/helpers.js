"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.verify = exports.getKivoConfig = exports.error = exports.ip = void 0;
const express_validator_1 = require("express-validator");
const signale_1 = __importDefault(require("signale"));
const utils_1 = require("../utils");
const env_1 = __importDefault(require("../env"));
const winston_1 = require("../config/winston");
const ip = (req, res, next) => {
    req.realIP =
        req.headers["x-real-ip"] || req.connection.remoteAddress || "";
    return next();
};
exports.ip = ip;
// eslint-disable-next-line
const error = (error, _req, res, _next) => {
    winston_1.logger.error(error);
    if (env_1.default.isDev) {
        signale_1.default.fatal(error);
    }
    if (error instanceof utils_1.CustomError) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred." });
};
exports.error = error;
const getKivoConfig = () => {
    return {
        KIVO_CLIENT_ID: process.env.KIVO_CLIENT_ID,
        KIVO_CLIENT_SECRET: process.env.KIVO_CLIENT_SECRET,
        KIVO_PROVIDER_URL: process.env.KIVO_PROVIDER_URL,
        KIVO_AUTHORIZE_PATH: process.env.KIVO_AUTHORIZE_PATH,
        KIVO_CALLBACK_URL: process.env.KIVO_CALLBACK_URL,
        KIVO_SCOPE: process.env.KIVO_SCOPE,
        KIVO_TOKEN_HOST: process.env.KIVO_TOKEN_HOST,
    };
};
exports.getKivoConfig = getKivoConfig;
const verify = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const message = errors.array()[0].msg;
        throw new utils_1.CustomError(message, 400);
    }
    return next();
};
exports.verify = verify;
const query = (req, res, next) => {
    const { admin } = req.user || {};
    if (typeof req.query.limit !== "undefined" &&
        typeof req.query.limit !== "string") {
        return res.status(400).json({ error: "limit query is not valid." });
    }
    if (typeof req.query.skip !== "undefined" &&
        typeof req.query.skip !== "string") {
        return res.status(400).json({ error: "skip query is not valid." });
    }
    if (typeof req.query.search !== "undefined" &&
        typeof req.query.search !== "string") {
        return res.status(400).json({ error: "search query is not valid." });
    }
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    req.context = {
        limit: limit > 50 ? 50 : limit,
        skip,
        all: admin ? req.query.all === "true" : false
    };
    next();
};
exports.query = query;
//# sourceMappingURL=helpers.js.map