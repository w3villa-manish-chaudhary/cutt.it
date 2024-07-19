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
exports.incrementVisit = exports.update = exports.batchRemove = exports.remove = exports.create = exports.find = exports.get = exports.total = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../utils");
const redis_1 = __importStar(require("../redis")), redis = redis_1;
const knex_1 = __importDefault(require("../knex"));
const selectable = [
    "links.id",
    "links.address",
    "links.banned",
    "links.created_at",
    "links.domain_id",
    "links.updated_at",
    "links.password",
    "links.description",
    "links.expire_in",
    "links.target",
    "links.visit_count",
    "links.user_id",
    "links.uuid",
    "domains.address as domain"
];
const normalizeMatch = (match) => {
    const newMatch = { ...match };
    if (newMatch.address) {
        newMatch["links.address"] = newMatch.address;
        delete newMatch.address;
    }
    if (newMatch.user_id) {
        newMatch["links.user_id"] = newMatch.user_id;
        delete newMatch.user_id;
    }
    if (newMatch.uuid) {
        newMatch["links.uuid"] = newMatch.uuid;
        delete newMatch.uuid;
    }
    return newMatch;
};
const total = async (match, params = {}) => {
    const query = (0, knex_1.default)("links");
    Object.entries(match).forEach(([key, value]) => {
        query.andWhere(key, ...(Array.isArray(value) ? value : [value]));
    });
    if (params.search) {
        query.andWhereRaw("links.description || ' '  || links.address || ' ' || target ILIKE '%' || ? || '%'", [params.search]);
    }
    const [{ count }] = await query.count("id");
    return typeof count === "number" ? count : parseInt(count);
};
exports.total = total;
const get = async (match, params) => {
    const query = (0, knex_1.default)("links")
        .select(...selectable)
        .where(normalizeMatch(match))
        .offset(params.skip)
        .limit(params.limit)
        .orderBy("created_at", "desc");
    if (params.search) {
        query.andWhereRaw("concat_ws(' ', description, links.address, target, domains.address) ILIKE '%' || ? || '%'", [params.search]);
    }
    query.leftJoin("domains", "links.domain_id", "domains.id");
    const links = await query;
    return links;
};
exports.get = get;
const find = async (match) => {
    if (match.address && match.domain_id) {
        const key = redis.key.link(match.address, match.domain_id);
        const cachedLink = await redis_1.default.get(key);
        if (cachedLink)
            return JSON.parse(cachedLink);
    }
    const link = await (0, knex_1.default)("links")
        .select(...selectable)
        .where(normalizeMatch(match))
        .leftJoin("domains", "links.domain_id", "domains.id")
        .first();
    if (link) {
        const key = redis.key.link(link.address, link.domain_id);
        redis_1.default.set(key, JSON.stringify(link), "EX", 60 * 60 * 2);
    }
    return link;
};
exports.find = find;
const create = async (params) => {
    let encryptedPassword = null;
    if (params.password) {
        const salt = await bcryptjs_1.default.genSalt(12);
        encryptedPassword = await bcryptjs_1.default.hash(params.password, salt);
    }
    const [link] = await (0, knex_1.default)("links").insert({
        password: encryptedPassword,
        domain_id: params.domain_id || null,
        user_id: params.user_id || null,
        address: params.address,
        description: params.description || null,
        expire_in: params.expire_in || null,
        target: params.target
    }, "*");
    return link;
};
exports.create = create;
const remove = async (match) => {
    const link = await (0, knex_1.default)("links")
        .where(match)
        .first();
    if (!link) {
        throw new utils_1.CustomError("Link was not found.");
    }
    const deletedLink = await (0, knex_1.default)("links")
        .where("id", link.id)
        .delete();
    redis.remove.link(link);
    return !!deletedLink;
};
exports.remove = remove;
const batchRemove = async (match) => {
    const deleteQuery = (0, knex_1.default)("links");
    const findQuery = (0, knex_1.default)("links");
    Object.entries(match).forEach(([key, value]) => {
        findQuery.andWhere(key, ...(Array.isArray(value) ? value : [value]));
        deleteQuery.andWhere(key, ...(Array.isArray(value) ? value : [value]));
    });
    const links = await findQuery;
    links.forEach(redis.remove.link);
    await deleteQuery.delete();
};
exports.batchRemove = batchRemove;
const update = async (match, update) => {
    if (update.password) {
        const salt = await bcryptjs_1.default.genSalt(12);
        update.password = await bcryptjs_1.default.hash(update.password, salt);
    }
    const links = await (0, knex_1.default)("links")
        .where(match)
        .update({ ...update, updated_at: new Date().toISOString() }, "*");
    links.forEach(redis.remove.link);
    return links;
};
exports.update = update;
const incrementVisit = async (match) => {
    return (0, knex_1.default)("links")
        .where(match)
        .increment("visit_count", 1);
};
exports.incrementVisit = incrementVisit;
//# sourceMappingURL=link.js.map