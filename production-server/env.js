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
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const envalid_1 = require("envalid");
dotenv.config();
const env = (0, envalid_1.cleanEnv)(process.env, {
    PORT: (0, envalid_1.num)({ default: 3000 }),
    SITE_NAME: (0, envalid_1.str)({ example: "Kutt" }),
    DEFAULT_DOMAIN: (0, envalid_1.str)({ example: "kutt.it" }),
    LINK_LENGTH: (0, envalid_1.num)({ default: 6 }),
    DB_HOST: (0, envalid_1.str)({ default: "localhost" }),
    DB_PORT: (0, envalid_1.num)({ default: 5432 }),
    DB_NAME: (0, envalid_1.str)({ default: "postgres" }),
    DB_USER: (0, envalid_1.str)(),
    DB_PASSWORD: (0, envalid_1.str)(),
    DB_SSL: (0, envalid_1.bool)({ default: false }),
    DB_POOL_MIN: (0, envalid_1.num)({ default: 2 }),
    DB_POOL_MAX: (0, envalid_1.num)({ default: 10 }),
    REDIS_HOST: (0, envalid_1.str)({ default: "127.0.0.1" }),
    REDIS_PORT: (0, envalid_1.num)({ default: 6379 }),
    REDIS_PASSWORD: (0, envalid_1.str)({ default: "" }),
    REDIS_DB: (0, envalid_1.num)({ default: 0 }),
    USER_LIMIT_PER_DAY: (0, envalid_1.num)({ default: 50 }),
    NON_USER_COOLDOWN: (0, envalid_1.num)({ default: 10 }),
    DEFAULT_MAX_STATS_PER_LINK: (0, envalid_1.num)({ default: 5000 }),
    DISALLOW_ANONYMOUS_LINKS: (0, envalid_1.bool)({ default: false }),
    DISALLOW_REGISTRATION: (0, envalid_1.bool)({ default: false }),
    CUSTOM_DOMAIN_USE_HTTPS: (0, envalid_1.bool)({ default: false }),
    JWT_SECRET: (0, envalid_1.str)(),
    ADMIN_EMAILS: (0, envalid_1.str)({ default: "" }),
    RECAPTCHA_SITE_KEY: (0, envalid_1.str)({ default: "" }),
    RECAPTCHA_SECRET_KEY: (0, envalid_1.str)({ default: "" }),
    GOOGLE_SAFE_BROWSING_KEY: (0, envalid_1.str)({ default: "" }),
    MAIL_HOST: (0, envalid_1.str)(),
    MAIL_PORT: (0, envalid_1.num)(),
    MAIL_SECURE: (0, envalid_1.bool)({ default: false }),
    MAIL_USER: (0, envalid_1.str)(),
    MAIL_FROM: (0, envalid_1.str)({ default: "", example: "Kutt <support@kutt.it>" }),
    MAIL_PASSWORD: (0, envalid_1.str)(),
    REPORT_EMAIL: (0, envalid_1.str)({ default: "" }),
    CONTACT_EMAIL: (0, envalid_1.str)({ default: "" })
});
exports.default = env;
//# sourceMappingURL=env.js.map