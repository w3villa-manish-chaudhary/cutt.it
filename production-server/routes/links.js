"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cors_1 = __importDefault(require("cors"));
const validators = __importStar(require("../handlers/validators"));
const helpers = __importStar(require("../handlers/helpers"));
const link = __importStar(require("../handlers/links"));
const auth = __importStar(require("../handlers/auth"));
const env_1 = __importDefault(require("../env"));
const router = (0, express_1.Router)();
router.get("/", (0, express_async_handler_1.default)(auth.apikey), (0, express_async_handler_1.default)(auth.jwt), helpers.query, (0, express_async_handler_1.default)(link.get));
router.post("/", (0, cors_1.default)(), (0, express_async_handler_1.default)(auth.apikey), (0, express_async_handler_1.default)(env_1.default.DISALLOW_ANONYMOUS_LINKS ? auth.jwt : auth.jwtLoose), (0, express_async_handler_1.default)(auth.recaptcha), (0, express_async_handler_1.default)(auth.cooldown), validators.createLink, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(link.create));
router.patch("/:id", (0, express_async_handler_1.default)(auth.apikey), (0, express_async_handler_1.default)(auth.jwt), validators.editLink, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(link.edit));
router.delete("/:id", (0, express_async_handler_1.default)(auth.apikey), (0, express_async_handler_1.default)(auth.jwt), validators.deleteLink, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(link.remove));
router.get("/:id/stats", (0, express_async_handler_1.default)(auth.apikey), (0, express_async_handler_1.default)(auth.jwt), validators.getStats, (0, express_async_handler_1.default)(link.stats));
router.post("/:id/protected", validators.redirectProtected, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(link.redirectProtected));
router.post("/report", validators.reportLink, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(link.report));
router.post("/admin/ban/:id", (0, express_async_handler_1.default)(auth.apikey), (0, express_async_handler_1.default)(auth.jwt), (0, express_async_handler_1.default)(auth.admin), validators.banLink, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(link.ban));
exports.default = router;
//# sourceMappingURL=links.js.map