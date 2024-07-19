"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeWww = exports.sanitize = exports.getInitStats = exports.STATS_PERIODS = exports.getUTCDate = exports.getDifferenceFunction = exports.statsObjectToArray = exports.getStatsCacheTime = exports.getStatsLimit = exports.getRedisKey = exports.generateShortLink = exports.addProtocol = exports.generateId = exports.signToken = exports.isAdmin = exports.CustomError = void 0;
const ms_1 = __importDefault(require("ms"));
const generate_1 = __importDefault(require("nanoid/generate"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const date_fns_1 = require("date-fns");
const queries_1 = __importDefault(require("../queries"));
const env_1 = __importDefault(require("../env"));
class CustomError extends Error {
    constructor(message, statusCode = 500, data) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.data = data;
    }
}
exports.CustomError = CustomError;
const isAdmin = (email) => env_1.default.ADMIN_EMAILS.split(",")
    .map((e) => e.trim())
    .includes(email);
exports.isAdmin = isAdmin;
const signToken = (user) => jsonwebtoken_1.default.sign({
    iss: "ApiAuth",
    sub: user.email,
    domain: user.domain || "",
    admin: (0, exports.isAdmin)(user.email),
    iat: parseInt((new Date().getTime() / 1000).toFixed(0)),
    exp: parseInt(((0, date_fns_1.addDays)(new Date(), 7).getTime() / 1000).toFixed(0))
}, env_1.default.JWT_SECRET);
exports.signToken = signToken;
const generateId = async (domain_id = null) => {
    const address = (0, generate_1.default)("abcdefghkmnpqrstuvwxyzABCDEFGHKLMNPQRSTUVWXYZ23456789", env_1.default.LINK_LENGTH);
    const link = await queries_1.default.link.find({ address, domain_id });
    if (!link)
        return address;
    return (0, exports.generateId)(domain_id);
};
exports.generateId = generateId;
const addProtocol = (url) => {
    const hasProtocol = /^\w+:\/\//.test(url);
    return hasProtocol ? url : `http://${url}`;
};
exports.addProtocol = addProtocol;
const generateShortLink = (id, domain) => {
    const protocol = env_1.default.CUSTOM_DOMAIN_USE_HTTPS || !domain ? "https://" : "http://";
    return `${protocol}${domain || env_1.default.DEFAULT_DOMAIN}/${id}`;
};
exports.generateShortLink = generateShortLink;
exports.getRedisKey = {
    // TODO: remove user id and make domain id required
    link: (address, domain_id, user_id) => `${address}-${domain_id || ""}-${user_id || ""}`,
    domain: (address) => `d-${address}`,
    host: (address) => `h-${address}`,
    user: (emailOrKey) => `u-${emailOrKey}`
};
// TODO: Add statsLimit
const getStatsLimit = () => env_1.default.DEFAULT_MAX_STATS_PER_LINK || 100000000;
exports.getStatsLimit = getStatsLimit;
const getStatsCacheTime = (total) => {
    return (total > 50000 ? (0, ms_1.default)("5 minutes") : (0, ms_1.default)("1 minutes")) / 1000;
};
exports.getStatsCacheTime = getStatsCacheTime;
const statsObjectToArray = (obj) => {
    const objToArr = (key) => Array.from(Object.keys(obj[key]))
        .map((name) => ({
        name,
        value: obj[key][name]
    }))
        .sort((a, b) => b.value - a.value);
    return {
        browser: objToArr("browser"),
        os: objToArr("os"),
        country: objToArr("country"),
        referrer: objToArr("referrer")
    };
};
exports.statsObjectToArray = statsObjectToArray;
const getDifferenceFunction = (type) => {
    if (type === "lastDay")
        return date_fns_1.differenceInHours;
    if (type === "lastWeek")
        return date_fns_1.differenceInDays;
    if (type === "lastMonth")
        return date_fns_1.differenceInDays;
    if (type === "allTime")
        return date_fns_1.differenceInMonths;
    throw new Error("Unknown type.");
};
exports.getDifferenceFunction = getDifferenceFunction;
const getUTCDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours());
};
exports.getUTCDate = getUTCDate;
exports.STATS_PERIODS = [
    [1, "lastDay"],
    [7, "lastWeek"],
    [30, "lastMonth"]
];
const getInitStats = () => {
    return Object.create({
        browser: {
            chrome: 0,
            edge: 0,
            firefox: 0,
            ie: 0,
            opera: 0,
            other: 0,
            safari: 0
        },
        os: {
            android: 0,
            ios: 0,
            linux: 0,
            macos: 0,
            other: 0,
            windows: 0
        },
        country: {},
        referrer: {}
    });
};
exports.getInitStats = getInitStats;
exports.sanitize = {
    domain: (domain) => ({
        ...domain,
        id: domain.uuid,
        uuid: undefined,
        user_id: undefined,
        banned_by_id: undefined
    }),
    link: (link) => ({
        ...link,
        banned_by_id: undefined,
        domain_id: undefined,
        user_id: undefined,
        uuid: undefined,
        id: link.uuid,
        password: !!link.password,
        link: (0, exports.generateShortLink)(link.address, link.domain)
    })
};
const removeWww = (host = "") => {
    return host.replace("www.", "");
};
exports.removeWww = removeWww;
//# sourceMappingURL=index.js.map