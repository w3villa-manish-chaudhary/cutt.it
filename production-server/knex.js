"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const env_1 = __importDefault(require("./env"));
const db = (0, knex_1.default)({
    client: "postgres",
    connection: {
        host: env_1.default.DB_HOST,
        port: env_1.default.DB_PORT,
        database: env_1.default.DB_NAME,
        user: env_1.default.DB_USER,
        password: env_1.default.DB_PASSWORD,
        ssl: env_1.default.DB_SSL,
        pool: {
            min: env_1.default.DB_POOL_MIN,
            max: env_1.default.DB_POOL_MAX
        }
    }
});
exports.default = db;
//# sourceMappingURL=knex.js.map