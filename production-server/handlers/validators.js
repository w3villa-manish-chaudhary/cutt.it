"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannedHost = exports.bannedDomain = exports.linksCount = exports.malware = exports.cooldown = exports.deleteUser = exports.resetEmailRequest = exports.resetPasswordRequest = exports.changePassword = exports.login = exports.signup = exports.getStats = exports.banLink = exports.reportLink = exports.deleteLink = exports.removeDomain = exports.addDomain = exports.redirectProtected = exports.editLink = exports.createLink = exports.checkUser = exports.preservedUrls = void 0;
const express_validator_1 = require("express-validator");
const date_fns_1 = require("date-fns");
const url_regex_safe_1 = __importDefault(require("url-regex-safe"));
const util_1 = require("util");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const dns_1 = __importDefault(require("dns"));
const url_1 = __importDefault(require("url"));
const ms_1 = __importDefault(require("ms"));
const utils_1 = require("../utils");
const queries_1 = __importDefault(require("../queries"));
const knex_1 = __importDefault(require("../knex"));
const env_1 = __importDefault(require("../env"));
const dnsLookup = (0, util_1.promisify)(dns_1.default.lookup);
exports.preservedUrls = [
    "login",
    "logout",
    "signup",
    "reset-password",
    "resetpassword",
    "url-password",
    "url-info",
    "settings",
    "stats",
    "verify",
    "api",
    "404",
    "static",
    "images",
    "banned",
    "terms",
    "privacy",
    "protected",
    "report",
    "pricing"
];
const checkUser = (value, { req }) => !!req.user;
exports.checkUser = checkUser;
exports.createLink = [
    (0, express_validator_1.body)("target")
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage("Target is missing.")
        .isString()
        .trim()
        .isLength({ min: 1, max: 2040 })
        .withMessage("Maximum URL length is 2040.")
        .customSanitizer(utils_1.addProtocol)
        .custom(value => (0, url_regex_safe_1.default)({ exact: true, strict: false }).test(value) ||
        /^(?!https?)(\w+):\/\//.test(value))
        .withMessage("URL is not valid.")
        .custom(value => (0, utils_1.removeWww)(url_1.default.parse(value).host) !== env_1.default.DEFAULT_DOMAIN)
        .withMessage(`${env_1.default.DEFAULT_DOMAIN} URLs are not allowed.`),
    (0, express_validator_1.body)("password")
        .optional({ nullable: true, checkFalsy: true })
        .custom(exports.checkUser)
        .withMessage("Only users can use this field.")
        .isString()
        .isLength({ min: 3, max: 64 })
        .withMessage("Password length must be between 3 and 64."),
    (0, express_validator_1.body)("customurl")
        .optional({ nullable: true, checkFalsy: true })
        .custom(exports.checkUser)
        .withMessage("Only users can use this field.")
        .isString()
        .trim()
        .isLength({ min: 1, max: 64 })
        .withMessage("Custom URL length must be between 1 and 64.")
        .custom(value => /^[a-zA-Z0-9-_]+$/g.test(value))
        .withMessage("Custom URL is not valid")
        .custom(value => !exports.preservedUrls.some(url => url.toLowerCase() === value))
        .withMessage("You can't use this custom URL."),
    (0, express_validator_1.body)("reuse")
        .optional({ nullable: true })
        .custom(exports.checkUser)
        .withMessage("Only users can use this field.")
        .isBoolean()
        .withMessage("Reuse must be boolean."),
    (0, express_validator_1.body)("description")
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .trim()
        .isLength({ min: 0, max: 2040 })
        .withMessage("Description length must be between 0 and 2040."),
    (0, express_validator_1.body)("expire_in")
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .trim()
        .custom(value => {
        try {
            return !!(0, ms_1.default)(value);
        }
        catch (_a) {
            return false;
        }
    })
        .withMessage("Expire format is invalid. Valid examples: 1m, 8h, 42 days.")
        .customSanitizer(ms_1.default)
        .custom(value => value >= (0, ms_1.default)("1m"))
        .withMessage("Minimum expire time should be '1 minute'.")
        .customSanitizer(value => (0, date_fns_1.addMilliseconds)(new Date(), value).toISOString()),
    (0, express_validator_1.body)("domain")
        .optional({ nullable: true, checkFalsy: true })
        .custom(exports.checkUser)
        .withMessage("Only users can use this field.")
        .isString()
        .withMessage("Domain should be string.")
        .customSanitizer(value => value.toLowerCase())
        .customSanitizer(value => (0, utils_1.removeWww)(url_1.default.parse(value).hostname || value))
        .custom(async (address, { req }) => {
        if (address === env_1.default.DEFAULT_DOMAIN) {
            req.body.domain = null;
            return;
        }
        const domain = await queries_1.default.domain.find({
            address,
            user_id: req.user.id
        });
        req.body.domain = domain || null;
        if (!domain)
            return Promise.reject();
    })
        .withMessage("You can't use this domain.")
];
exports.editLink = [
    (0, express_validator_1.body)("target")
        .optional({ checkFalsy: true, nullable: true })
        .isString()
        .trim()
        .isLength({ min: 1, max: 2040 })
        .withMessage("Maximum URL length is 2040.")
        .customSanitizer(utils_1.addProtocol)
        .custom(value => (0, url_regex_safe_1.default)({ exact: true, strict: false }).test(value) ||
        /^(?!https?)(\w+):\/\//.test(value))
        .withMessage("URL is not valid.")
        .custom(value => (0, utils_1.removeWww)(url_1.default.parse(value).host) !== env_1.default.DEFAULT_DOMAIN)
        .withMessage(`${env_1.default.DEFAULT_DOMAIN} URLs are not allowed.`),
    (0, express_validator_1.body)("password")
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .isLength({ min: 3, max: 64 })
        .withMessage("Password length must be between 3 and 64."),
    (0, express_validator_1.body)("address")
        .optional({ checkFalsy: true, nullable: true })
        .isString()
        .trim()
        .isLength({ min: 1, max: 64 })
        .withMessage("Custom URL length must be between 1 and 64.")
        .custom(value => /^[a-zA-Z0-9-_]+$/g.test(value))
        .withMessage("Custom URL is not valid")
        .custom(value => !exports.preservedUrls.some(url => url.toLowerCase() === value))
        .withMessage("You can't use this custom URL."),
    (0, express_validator_1.body)("expire_in")
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .trim()
        .custom(value => {
        try {
            return !!(0, ms_1.default)(value);
        }
        catch (_a) {
            return false;
        }
    })
        .withMessage("Expire format is invalid. Valid examples: 1m, 8h, 42 days.")
        .customSanitizer(ms_1.default)
        .custom(value => value >= (0, ms_1.default)("1m"))
        .withMessage("Minimum expire time should be '1 minute'.")
        .customSanitizer(value => (0, date_fns_1.addMilliseconds)(new Date(), value).toISOString()),
    (0, express_validator_1.body)("description")
        .optional({ nullable: true, checkFalsy: true })
        .isString()
        .trim()
        .isLength({ min: 0, max: 2040 })
        .withMessage("Description length must be between 0 and 2040."),
    (0, express_validator_1.param)("id", "ID is invalid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 36, max: 36 })
];
exports.redirectProtected = [
    (0, express_validator_1.body)("password", "Password is invalid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isString()
        .isLength({ min: 3, max: 64 })
        .withMessage("Password length must be between 3 and 64."),
    (0, express_validator_1.param)("id", "ID is invalid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 36, max: 36 })
];
exports.addDomain = [
    (0, express_validator_1.body)("address", "Domain is not valid")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 3, max: 64 })
        .withMessage("Domain length must be between 3 and 64.")
        .trim()
        .customSanitizer(value => {
        const parsed = url_1.default.parse(value);
        return (0, utils_1.removeWww)(parsed.hostname || parsed.href);
    })
        .custom(value => (0, url_regex_safe_1.default)({ exact: true, strict: false }).test(value))
        .custom(value => value !== env_1.default.DEFAULT_DOMAIN)
        .withMessage("You can't use the default domain.")
        .custom(async (value) => {
        const domain = await queries_1.default.domain.find({ address: value });
        if ((domain === null || domain === void 0 ? void 0 : domain.user_id) || (domain === null || domain === void 0 ? void 0 : domain.banned))
            return Promise.reject();
    })
        .withMessage("You can't add this domain."),
    (0, express_validator_1.body)("homepage")
        .optional({ checkFalsy: true, nullable: true })
        .customSanitizer(utils_1.addProtocol)
        .custom(value => (0, url_regex_safe_1.default)({ exact: true, strict: false }).test(value))
        .withMessage("Homepage is not valid.")
];
exports.removeDomain = [
    (0, express_validator_1.param)("id", "ID is invalid.")
        .exists({
        checkFalsy: true,
        checkNull: true
    })
        .isLength({ min: 36, max: 36 })
];
exports.deleteLink = [
    (0, express_validator_1.param)("id", "ID is invalid.")
        .exists({
        checkFalsy: true,
        checkNull: true
    })
        .isLength({ min: 36, max: 36 })
];
exports.reportLink = [
    (0, express_validator_1.body)("link", "No link has been provided.")
        .exists({
        checkFalsy: true,
        checkNull: true
    })
        .customSanitizer(utils_1.addProtocol)
        .custom(value => (0, utils_1.removeWww)(url_1.default.parse(value).hostname) === env_1.default.DEFAULT_DOMAIN)
        .withMessage(`You can only report a ${env_1.default.DEFAULT_DOMAIN} link.`)
];
exports.banLink = [
    (0, express_validator_1.param)("id", "ID is invalid.")
        .exists({
        checkFalsy: true,
        checkNull: true
    })
        .isLength({ min: 36, max: 36 }),
    (0, express_validator_1.body)("host", '"host" should be a boolean.')
        .optional({
        nullable: true
    })
        .isBoolean(),
    (0, express_validator_1.body)("user", '"user" should be a boolean.')
        .optional({
        nullable: true
    })
        .isBoolean(),
    (0, express_validator_1.body)("userlinks", '"userlinks" should be a boolean.')
        .optional({
        nullable: true
    })
        .isBoolean(),
    (0, express_validator_1.body)("domain", '"domain" should be a boolean.')
        .optional({
        nullable: true
    })
        .isBoolean()
];
exports.getStats = [
    (0, express_validator_1.param)("id", "ID is invalid.")
        .exists({
        checkFalsy: true,
        checkNull: true
    })
        .isLength({ min: 36, max: 36 })
];
exports.signup = [
    (0, express_validator_1.body)("password", "Password is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 8, max: 64 })
        .withMessage("Password length must be between 8 and 64."),
    (0, express_validator_1.body)("email", "Email is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .trim()
        .isEmail()
        .isLength({ min: 0, max: 255 })
        .withMessage("Email length must be max 255.")
        .custom(async (value, { req }) => {
        const user = await queries_1.default.user.find({ email: value });
        if (user) {
            req.user = user;
        }
        if (user === null || user === void 0 ? void 0 : user.verified)
            return Promise.reject();
    })
        .withMessage("You can't use this email address.")
];
exports.login = [
    (0, express_validator_1.body)("password", "Password is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 8, max: 64 })
        .withMessage("Password length must be between 8 and 64."),
    (0, express_validator_1.body)("email", "Email is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .trim()
        .isEmail()
        .isLength({ min: 0, max: 255 })
        .withMessage("Email length must be max 255.")
];
exports.changePassword = [
    (0, express_validator_1.body)("password", "Password is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 8, max: 64 })
        .withMessage("Password length must be between 8 and 64.")
];
exports.resetPasswordRequest = [
    (0, express_validator_1.body)("email", "Email is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .trim()
        .isEmail()
        .isLength({ min: 0, max: 255 })
        .withMessage("Email length must be max 255."),
    (0, express_validator_1.body)("password", "Password is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 8, max: 64 })
        .withMessage("Password length must be between 8 and 64.")
];
exports.resetEmailRequest = [
    (0, express_validator_1.body)("email", "Email is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .trim()
        .isEmail()
        .isLength({ min: 0, max: 255 })
        .withMessage("Email length must be max 255.")
];
exports.deleteUser = [
    (0, express_validator_1.body)("password", "Password is not valid.")
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 8, max: 64 })
        .custom(async (password, { req }) => {
        const isMatch = await bcryptjs_1.default.compare(password, req.user.password);
        if (!isMatch)
            return Promise.reject();
    })
];
const cooldown = (user) => {
    if (!env_1.default.GOOGLE_SAFE_BROWSING_KEY || !user || !user.cooldowns)
        return;
    // If has active cooldown then throw error
    const hasCooldownNow = user.cooldowns.some(cooldown => (0, date_fns_1.isAfter)((0, date_fns_1.subHours)(new Date(), 12), new Date(cooldown)));
    if (hasCooldownNow) {
        throw new utils_1.CustomError("Cooldown because of a malware URL. Wait 12h");
    }
};
exports.cooldown = cooldown;
const malware = async (user, target) => {
    if (!env_1.default.GOOGLE_SAFE_BROWSING_KEY)
        return;
    const isMalware = await axios_1.default.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env_1.default.GOOGLE_SAFE_BROWSING_KEY}`, {
        client: {
            clientId: env_1.default.DEFAULT_DOMAIN.toLowerCase().replace(".", ""),
            clientVersion: "1.0.0"
        },
        threatInfo: {
            threatTypes: [
                "THREAT_TYPE_UNSPECIFIED",
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            platformTypes: ["ANY_PLATFORM", "PLATFORM_TYPE_UNSPECIFIED"],
            threatEntryTypes: [
                "EXECUTABLE",
                "URL",
                "THREAT_ENTRY_TYPE_UNSPECIFIED"
            ],
            threatEntries: [{ url: target }]
        }
    });
    if (!isMalware.data || !isMalware.data.matches)
        return;
    if (user) {
        const [updatedUser] = await queries_1.default.user.update({ id: user.id }, {
            cooldowns: knex_1.default.raw("array_append(cooldowns, ?)", [
                new Date().toISOString()
            ])
        });
        // Ban if too many cooldowns
        if (updatedUser.cooldowns.length > 2) {
            await queries_1.default.user.update({ id: user.id }, { banned: true });
            throw new utils_1.CustomError("Too much malware requests. You are now banned.");
        }
    }
    throw new utils_1.CustomError(user ? "Malware detected! Cooldown for 12h." : "Malware detected!");
};
exports.malware = malware;
const linksCount = async (user) => {
    if (!user)
        return;
    const count = await queries_1.default.link.total({
        user_id: user.id,
        created_at: [">", (0, date_fns_1.subDays)(new Date(), 1).toISOString()]
    });
    if (count > env_1.default.USER_LIMIT_PER_DAY) {
        throw new utils_1.CustomError(`You have reached your daily limit (${env_1.default.USER_LIMIT_PER_DAY}). Please wait 24h.`);
    }
};
exports.linksCount = linksCount;
const bannedDomain = async (domain) => {
    const isBanned = await queries_1.default.domain.find({
        address: domain,
        banned: true
    });
    if (isBanned) {
        throw new utils_1.CustomError("URL is containing malware/scam.", 400);
    }
};
exports.bannedDomain = bannedDomain;
const bannedHost = async (domain) => {
    let isBanned;
    try {
        const dnsRes = await dnsLookup(domain);
        if (!dnsRes || !dnsRes.address)
            return;
        isBanned = await queries_1.default.host.find({
            address: dnsRes.address,
            banned: true
        });
    }
    catch (error) {
        isBanned = null;
    }
    if (isBanned) {
        throw new utils_1.CustomError("URL is containing malware/scam.", 400);
    }
};
exports.bannedHost = bannedHost;
//# sourceMappingURL=validators.js.map