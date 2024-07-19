"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = exports.find = exports.add = void 0;
const date_fns_1 = require("date-fns");
const knex_1 = __importDefault(require("../knex"));
const env_1 = __importDefault(require("../env"));
const add = async (ipToAdd) => {
    const ip = ipToAdd.toLowerCase();
    const currentIP = await (0, knex_1.default)("ips")
        .where("ip", ip)
        .first();
    if (currentIP) {
        const currentDate = new Date().toISOString();
        await (0, knex_1.default)("ips")
            .where({ ip })
            .update({
            created_at: currentDate,
            updated_at: currentDate
        });
    }
    else {
        await (0, knex_1.default)("ips").insert({ ip });
    }
    return ip;
};
exports.add = add;
const find = async (match) => {
    const query = (0, knex_1.default)("ips");
    Object.entries(match).forEach(([key, value]) => {
        query.andWhere(key, ...(Array.isArray(value) ? value : [value]));
    });
    const ip = await query.first();
    return ip;
};
exports.find = find;
const clear = async () => (0, knex_1.default)("ips")
    .where("created_at", "<", (0, date_fns_1.subMinutes)(new Date(), env_1.default.NON_USER_COOLDOWN).toISOString())
    .delete();
exports.clear = clear;
//# sourceMappingURL=ip.js.map