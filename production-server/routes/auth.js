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
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_1 = require("express");
const validators = __importStar(require("../handlers/validators"));
const helpers = __importStar(require("../handlers/helpers"));
const auth = __importStar(require("../handlers/auth"));
const router = (0, express_1.Router)();
router.post("/login", validators.login, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(auth.local), (0, express_async_handler_1.default)(auth.token));
router.post("/signup", auth.signupAccess, validators.signup, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(auth.signup));
router.post("/renew", (0, express_async_handler_1.default)(auth.jwt), (0, express_async_handler_1.default)(auth.token));
router.post("/change-password", (0, express_async_handler_1.default)(auth.jwt), validators.changePassword, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(auth.changePassword));
router.post("/change-email", (0, express_async_handler_1.default)(auth.jwt), validators.changePassword, (0, express_async_handler_1.default)(helpers.verify), (0, express_async_handler_1.default)(auth.changeEmailRequest));
router.post("/apikey", (0, express_async_handler_1.default)(auth.jwt), (0, express_async_handler_1.default)(auth.generateApiKey));
router.get("/signin/kivo", (0, express_async_handler_1.default)(auth.kivoSignIn));
router.get("/kivo/callback", (0, express_async_handler_1.default)(auth.kivoCallback));
router.post("/reset-password", (0, express_async_handler_1.default)(auth.resetPasswordRequest));
exports.default = router;
//# sourceMappingURL=auth.js.map