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
exports.update = exports.add = exports.get = exports.find = void 0;
const redis_1 = __importStar(require("../redis")), redis = redis_1;
const knex_1 = __importDefault(require("../knex"));
const find = async (match) => {
    if (match.address) {
        const cachedDomain = await redis_1.default.get(redis.key.domain(match.address));
        if (cachedDomain)
            return JSON.parse(cachedDomain);
    }
    const domain = await (0, knex_1.default)("domains")
        .where(match)
        .first();
    if (domain) {
        redis_1.default.set(redis.key.domain(domain.address), JSON.stringify(domain), "EX", 60 * 60 * 6);
    }
    return domain;
};
exports.find = find;
const get = async (match) => {
    return (0, knex_1.default)("domains").where(match);
};
exports.get = get;
const add = async (params) => {
    params.address = params.address.toLowerCase();
    const exists = await (0, knex_1.default)("domains")
        .where("address", params.address)
        .first();
    const newDomain = {
        address: params.address,
        homepage: params.homepage || null,
        user_id: params.user_id || null,
        banned: !!params.banned
    };
    let domain;
    if (exists) {
        const [response] = await (0, knex_1.default)("domains")
            .where("id", exists.id)
            .update({
            ...newDomain,
            updated_at: params.updated_at || new Date().toISOString()
        }, "*");
        domain = response;
    }
    else {
        const [response] = await (0, knex_1.default)("domains").insert(newDomain, "*");
        domain = response;
    }
    redis.remove.domain(domain);
    return domain;
};
exports.add = add;
const update = async (match, update) => {
    const domains = await (0, knex_1.default)("domains")
        .where(match)
        .update({ ...update, updated_at: new Date().toISOString() }, "*");
    domains.forEach(redis.remove.domain);
    return domains;
};
exports.update = update;
//# sourceMappingURL=domain.js.map