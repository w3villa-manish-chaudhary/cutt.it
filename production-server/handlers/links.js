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
exports.stats = exports.redirectCustomDomain = exports.redirectProtected = exports.redirect = exports.ban = exports.report = exports.remove = exports.edit = exports.create = exports.get = void 0;
const util_1 = require("util");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const isbot_1 = __importDefault(require("isbot"));
const url_1 = __importDefault(require("url"));
const dns_1 = __importDefault(require("dns"));
const validators = __importStar(require("./validators"));
const utils_1 = require("../utils");
const mail_1 = __importDefault(require("../mail/mail"));
const utils = __importStar(require("../utils"));
const queries_1 = __importDefault(require("../queries"));
const queues_1 = __importDefault(require("../queues"));
const env_1 = __importDefault(require("../env"));
const dnsLookup = (0, util_1.promisify)(dns_1.default.lookup);
const get = async (req, res) => {
    const { limit, skip, all } = req.context;
    const search = req.query.search;
    const userId = req.user.id;
    const match = {
        ...(!all && { user_id: userId })
    };
    const [links, total] = await Promise.all([
        queries_1.default.link.get(match, { limit, search, skip }),
        queries_1.default.link.total(match, { search })
    ]);
    const data = links.map(utils.sanitize.link);
    return res.send({
        total,
        limit,
        skip,
        data
    });
};
exports.get = get;
const create = async (req, res) => {
    const { reuse, password, customurl, description, target, domain, expire_in } = req.body;
    const domain_id = domain ? domain.id : null;
    const targetDomain = utils.removeWww(url_1.default.parse(target).hostname);
    const queries = await Promise.all([
        validators.cooldown(req.user),
        validators.malware(req.user, target),
        validators.linksCount(req.user),
        reuse &&
            queries_1.default.link.find({
                target,
                user_id: req.user.id,
                domain_id
            }),
        customurl &&
            queries_1.default.link.find({
                address: customurl,
                domain_id
            }),
        !customurl && utils.generateId(domain_id),
        validators.bannedDomain(targetDomain),
        validators.bannedHost(targetDomain)
    ]);
    // if "reuse" is true, try to return
    // the existent URL without creating one
    if (queries[3]) {
        return res.json(utils.sanitize.link(queries[3]));
    }
    // Check if custom link already exists
    if (queries[4]) {
        throw new utils_1.CustomError("Custom URL is already in use.");
    }
    // Create new link
    const address = customurl || queries[5];
    const link = await queries_1.default.link.create({
        password,
        address,
        domain_id,
        description,
        target,
        expire_in,
        user_id: req.user && req.user.id
    });
    if (!req.user && env_1.default.NON_USER_COOLDOWN) {
        queries_1.default.ip.add(req.realIP);
    }
    return res
        .status(201)
        .send(utils.sanitize.link({ ...link, domain: domain === null || domain === void 0 ? void 0 : domain.address }));
};
exports.create = create;
const edit = async (req, res) => {
    const { address, target, description, expire_in, password } = req.body;
    if (!address && !target) {
        throw new utils_1.CustomError("Should at least update one field.");
    }
    const link = await queries_1.default.link.find({
        uuid: req.params.id,
        ...(!req.user.admin && { user_id: req.user.id })
    });
    if (!link) {
        throw new utils_1.CustomError("Link was not found.");
    }
    const targetDomain = utils.removeWww(url_1.default.parse(target).hostname);
    const domain_id = link.domain_id || null;
    const queries = await Promise.all([
        validators.cooldown(req.user),
        validators.malware(req.user, target),
        address !== link.address &&
            queries_1.default.link.find({
                address,
                domain_id
            }),
        validators.bannedDomain(targetDomain),
        validators.bannedHost(targetDomain)
    ]);
    // Check if custom link already exists
    if (queries[2]) {
        throw new utils_1.CustomError("Custom URL is already in use.");
    }
    // Update link
    const [updatedLink] = await queries_1.default.link.update({
        id: link.id
    }, {
        ...(address && { address }),
        ...(description && { description }),
        ...(target && { target }),
        ...(expire_in && { expire_in }),
        ...(password && { password })
    });
    return res.status(200).send(utils.sanitize.link({ ...link, ...updatedLink }));
};
exports.edit = edit;
const remove = async (req, res) => {
    const link = await queries_1.default.link.remove({
        uuid: req.params.id,
        ...(!req.user.admin && { user_id: req.user.id })
    });
    if (!link) {
        throw new utils_1.CustomError("Could not delete the link");
    }
    return res
        .status(200)
        .send({ message: "Link has been deleted successfully." });
};
exports.remove = remove;
const report = async (req, res) => {
    const { link } = req.body;
    const mail = await mail_1.default.sendMail({
        from: env_1.default.MAIL_FROM || env_1.default.MAIL_USER,
        to: env_1.default.REPORT_EMAIL,
        subject: "[REPORT]",
        text: link,
        html: link
    });
    if (!mail.accepted.length) {
        throw new utils_1.CustomError("Couldn't submit the report. Try again later.");
    }
    return res
        .status(200)
        .send({ message: "Thanks for the report, we'll take actions shortly." });
};
exports.report = report;
const ban = async (req, res) => {
    const { id } = req.params;
    const update = {
        banned_by_id: req.user.id,
        banned: true
    };
    // 1. Check if link exists
    const link = await queries_1.default.link.find({ uuid: id });
    if (!link) {
        throw new utils_1.CustomError("No link has been found.", 400);
    }
    if (link.banned) {
        return res.status(200).send({ message: "Link has been banned already." });
    }
    const tasks = [];
    // 2. Ban link
    tasks.push(queries_1.default.link.update({ uuid: id }, update));
    const domain = utils.removeWww(url_1.default.parse(link.target).hostname);
    // 3. Ban target's domain
    if (req.body.domain) {
        tasks.push(queries_1.default.domain.add({ ...update, address: domain }));
    }
    // 4. Ban target's host
    if (req.body.host) {
        const dnsRes = await dnsLookup(domain).catch(() => {
            throw new utils_1.CustomError("Couldn't fetch DNS info.");
        });
        const host = dnsRes === null || dnsRes === void 0 ? void 0 : dnsRes.address;
        tasks.push(queries_1.default.host.add({ ...update, address: host }));
    }
    // 5. Ban link owner
    if (req.body.user && link.user_id) {
        tasks.push(queries_1.default.user.update({ id: link.user_id }, update));
    }
    // 6. Ban all of owner's links
    if (req.body.userLinks && link.user_id) {
        tasks.push(queries_1.default.link.update({ user_id: link.user_id }, update));
    }
    // 7. Wait for all tasks to finish
    await Promise.all(tasks).catch(() => {
        throw new utils_1.CustomError("Couldn't ban entries.");
    });
    // 8. Send response
    return res.status(200).send({ message: "Banned link successfully." });
};
exports.ban = ban;
const redirect = (app) => async (req, res, next) => {
    const isBot = (0, isbot_1.default)(req.headers["user-agent"]);
    const isPreservedUrl = validators.preservedUrls.some(item => item === req.path.replace("/", ""));
    if (isPreservedUrl)
        return next();
    // 1. If custom domain, get domain info
    const host = utils.removeWww(req.headers.host);
    const domain = host !== env_1.default.DEFAULT_DOMAIN
        ? await queries_1.default.domain.find({ address: host })
        : null;
    // 2. Get link
    const address = req.params.id.replace("+", "");
    const link = await queries_1.default.link.find({
        address,
        domain_id: domain ? domain.id : null
    });
    // 3. When no link, if has domain redirect to domain's homepage
    // otherwise redirect to 404
    if (!link) {
        return res.redirect(302, domain ? domain.homepage : "/404");
    }
    // 4. If link is banned, redirect to banned page.
    if (link.banned) {
        return res.redirect("/banned");
    }
    // 5. If wants to see link info, then redirect
    const doesRequestInfo = /.*\+$/gi.test(req.params.id);
    if (doesRequestInfo && !link.password) {
        return app.render(req, res, "/url-info", { target: link.target });
    }
    // 6. If link is protected, redirect to password page
    if (link.password) {
        return res.redirect(`/protected/${link.uuid}`);
    }
    // 7. Create link visit
    if (link.user_id && !isBot) {
        queues_1.default.visit.add({
            headers: req.headers,
            realIP: req.realIP,
            referrer: req.get("Referrer"),
            link
        });
    }
    // 8. Redirect to target
    return res.redirect(link.target);
};
exports.redirect = redirect;
const redirectProtected = async (req, res) => {
    // 1. Get link
    const uuid = req.params.id;
    const link = await queries_1.default.link.find({ uuid });
    // 2. Throw error if no link
    if (!link || !link.password) {
        throw new utils_1.CustomError("Couldn't find the link.", 400);
    }
    // 3. Check if password matches
    const matches = await bcryptjs_1.default.compare(req.body.password, link.password);
    if (!matches) {
        throw new utils_1.CustomError("Password is not correct.", 401);
    }
    // 4. Create visit
    if (link.user_id) {
        queues_1.default.visit.add({
            headers: req.headers,
            realIP: req.realIP,
            referrer: req.get("Referrer"),
            link
        });
    }
    // 5. Send target
    return res.status(200).send({ target: link.target });
};
exports.redirectProtected = redirectProtected;
const redirectCustomDomain = async (req, res, next) => {
    const { path } = req;
    const host = utils.removeWww(req.headers.host);
    if (host === env_1.default.DEFAULT_DOMAIN) {
        return next();
    }
    if (path === "/" ||
        validators.preservedUrls
            .filter(l => l !== "url-password")
            .some(item => item === path.replace("/", ""))) {
        const domain = await queries_1.default.domain.find({ address: host });
        const redirectURL = domain
            ? domain.homepage
            : `https://${env_1.default.DEFAULT_DOMAIN + path}`;
        return res.redirect(302, redirectURL);
    }
    return next();
};
exports.redirectCustomDomain = redirectCustomDomain;
const stats = async (req, res) => {
    const { user } = req;
    const uuid = req.params.id;
    const link = await queries_1.default.link.find({
        ...(!user.admin && { user_id: user.id }),
        uuid
    });
    if (!link) {
        throw new utils_1.CustomError("Link could not be found.");
    }
    const stats = await queries_1.default.visit.find({ link_id: link.id }, link.visit_count);
    if (!stats) {
        throw new utils_1.CustomError("Could not get the short link stats.");
    }
    return res.status(200).send({
        ...stats,
        ...utils.sanitize.link(link)
    });
};
exports.stats = stats;
//# sourceMappingURL=links.js.map