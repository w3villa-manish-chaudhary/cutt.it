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
exports.add = exports.find = void 0;
const redis_1 = __importStar(require("../redis")), redis = redis_1;
const knex_1 = __importDefault(require("../knex"));
const find = async (match) => {
    if (match.address) {
        const cachedHost = await redis_1.default.get(redis.key.host(match.address));
        if (cachedHost)
            return JSON.parse(cachedHost);
    }
    const host = await (0, knex_1.default)("hosts")
        .where(match)
        .first();
    if (host) {
        redis_1.default.set(redis.key.host(host.address), JSON.stringify(host), "EX", 60 * 60 * 6);
    }
    return host;
};
exports.find = find;
const add = async (params) => {
    params.address = params.address.toLowerCase();
    const exists = await (0, knex_1.default)("domains")
        .where("address", params.address)
        .first();
    const newHost = {
        address: params.address,
        banned: !!params.banned
    };
    let host;
    if (exists) {
        const [response] = await (0, knex_1.default)("hosts")
            .where("id", exists.id)
            .update({
            ...newHost,
            updated_at: params.updated_at || new Date().toISOString()
        }, "*");
        host = response;
    }
    else {
        const [response] = await (0, knex_1.default)("hosts").insert(newHost, "*");
        host = response;
    }
    redis.remove.host(host);
    return host;
};
exports.add = add;
//# sourceMappingURL=host.js.map