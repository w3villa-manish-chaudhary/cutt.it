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
exports.remove = exports.update = exports.add = exports.find = void 0;
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const redis_1 = __importStar(require("../redis")), redis = redis_1;
const knex_1 = __importDefault(require("../knex"));
const find = async (match) => {
    if (match.email || match.apikey) {
        const key = redis.key.user(match.email || match.apikey);
        const cachedUser = await redis_1.default.get(key);
        if (cachedUser)
            return JSON.parse(cachedUser);
    }
    const user = await (0, knex_1.default)("users").where(match).first();
    if (user) {
        const emailKey = redis.key.user(user.email);
        redis_1.default.set(emailKey, JSON.stringify(user), "EX", 60 * 60 * 1);
        if (user.apikey) {
            const apikeyKey = redis.key.user(user.apikey);
            redis_1.default.set(apikeyKey, JSON.stringify(user), "EX", 60 * 60 * 1);
        }
    }
    return user;
};
exports.find = find;
const add = async (params, user) => {
    const data = {
        email: params.email,
        password: params.password,
        verification_token: (0, uuid_1.v4)(),
        verification_expires: (0, date_fns_1.addMinutes)(new Date(), 60).toISOString()
    };
    if (user) {
        await (0, knex_1.default)("users")
            .where("id", user.id)
            .update({ ...data, updated_at: new Date().toISOString() });
    }
    else {
        await (0, knex_1.default)("users").insert(data);
    }
    redis.remove.user(user);
    return {
        ...user,
        ...data
    };
};
exports.add = add;
const update = async (match, update) => {
    const query = (0, knex_1.default)("users");
    Object.entries(match).forEach(([key, value]) => {
        query.andWhere(key, ...(Array.isArray(value) ? value : [value]));
    });
    const users = await query.update({ ...update, updated_at: new Date().toISOString() }, "*");
    users.forEach(redis.remove.user);
    return users;
};
exports.update = update;
const remove = async (user) => {
    const deletedUser = await (0, knex_1.default)("users").where("id", user.id).delete();
    redis.remove.user(user);
    return !!deletedUser;
};
exports.remove = remove;
//# sourceMappingURL=user.js.map