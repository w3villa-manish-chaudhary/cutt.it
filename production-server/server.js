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
const env_1 = __importDefault(require("./env"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const next_1 = __importDefault(require("next"));
const helpers = __importStar(require("./handlers/helpers"));
const links = __importStar(require("./handlers/links"));
const auth = __importStar(require("./handlers/auth"));
const routes_1 = __importDefault(require("./routes"));
const winston_1 = require("./config/winston");
require("./cron");
require("./passport");
const port = env_1.default.PORT;
const app = (0, next_1.default)({ dir: "./client", dev: env_1.default.isDev });
const handle = app.getRequestHandler();
app.prepare().then(async () => {
    const server = (0, express_1.default)();
    server.set("trust proxy", true);
    if (env_1.default.isDev) {
        server.use((0, morgan_1.default)("combined", { stream: winston_1.stream }));
    }
    server.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    server.use((0, cookie_parser_1.default)());
    server.use(express_1.default.json());
    server.use(express_1.default.urlencoded({ extended: true }));
    server.use(passport_1.default.initialize());
    server.use(express_1.default.static("static"));
    server.use(helpers.ip);
    server.use((0, express_async_handler_1.default)(links.redirectCustomDomain));
    server.use("/api/v2", routes_1.default);
    server.get("/reset-password/:resetPasswordToken?", (0, express_async_handler_1.default)(auth.resetPassword), (req, res) => app.render(req, res, "/reset-password", { token: req.token }));
    server.get("/verify-email/:changeEmailToken", (0, express_async_handler_1.default)(auth.changeEmail), (req, res) => app.render(req, res, "/verify-email", { token: req.token }));
    server.get("/verify/:verificationToken?", (0, express_async_handler_1.default)(auth.verify), (req, res) => app.render(req, res, "/verify", { token: req.token }));
    server.get("/:id", (0, express_async_handler_1.default)(links.redirect(app)));
    // Error handler
    server.use(helpers.error);
    // Handler everything else by Next.js
    server.get("*", (req, res) => handle(req, res));
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});
//# sourceMappingURL=server.js.map