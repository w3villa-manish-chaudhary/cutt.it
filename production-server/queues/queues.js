"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visit = void 0;
const bull_1 = __importDefault(require("bull"));
const path_1 = __importDefault(require("path"));
const env_1 = __importDefault(require("../env"));
const redis = {
    port: env_1.default.REDIS_PORT,
    host: env_1.default.REDIS_HOST,
    ...(env_1.default.REDIS_PASSWORD && { password: env_1.default.REDIS_PASSWORD })
};
const removeJob = job => job.remove();
exports.visit = new bull_1.default("visit", { redis });
exports.visit.clean(5000, "completed");
exports.visit.process(8, path_1.default.resolve(__dirname, "visit.js"));
exports.visit.on("completed", removeJob);
//# sourceMappingURL=queues.js.map