"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const domains_1 = __importDefault(require("./domains"));
const health_1 = __importDefault(require("./health"));
const links_1 = __importDefault(require("./links"));
const users_1 = __importDefault(require("./users"));
const auth_1 = __importDefault(require("./auth"));
const router = (0, express_1.Router)();
router.use("/domains", domains_1.default);
router.use("/health", health_1.default);
router.use("/links", links_1.default);
router.use("/users", users_1.default);
router.use("/auth", auth_1.default);
exports.default = router;
//# sourceMappingURL=routes.js.map