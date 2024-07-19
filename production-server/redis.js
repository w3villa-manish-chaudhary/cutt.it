"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.key = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = __importDefault(require("./env"));
const client = new ioredis_1.default({
    host: env_1.default.REDIS_HOST,
    port: env_1.default.REDIS_PORT,
    db: env_1.default.REDIS_DB,
    ...(env_1.default.REDIS_PASSWORD && { password: env_1.default.REDIS_PASSWORD })
});
exports.default = client;
exports.key = {
    link: (address, domain_id, user_id) => `${address}-${domain_id || ""}-${user_id || ""}`,
    domain: (address) => `d-${address}`,
    stats: (link_id) => `s-${link_id}`,
    host: (address) => `h-${address}`,
    user: (emailOrKey) => `u-${emailOrKey}`
};
exports.remove = {
    domain: (domain) => {
        if (!domain)
            return;
        return client.del(exports.key.domain(domain.address));
    },
    host: (host) => {
        if (!host)
            return;
        return client.del(exports.key.host(host.address));
    },
    link: (link) => {
        if (!link)
            return;
        return client.del(exports.key.link(link.address, link.domain_id));
    },
    user: (user) => {
        if (!user)
            return;
        return Promise.all([
            client.del(exports.key.user(user.email)),
            client.del(exports.key.user(user.apikey))
        ]);
    }
};
//# sourceMappingURL=redis.js.map