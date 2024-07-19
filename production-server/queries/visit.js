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
exports.find = exports.add = void 0;
const date_fns_1 = require("date-fns");
const utils = __importStar(require("../utils"));
const redis_1 = __importStar(require("../redis")), redis = redis_1;
const knex_1 = __importDefault(require("../knex"));
const add = async (params) => {
    const data = {
        ...params,
        country: params.country.toLowerCase(),
        referrer: params.referrer.toLowerCase()
    };
    const visit = await (0, knex_1.default)("visits")
        .where({ link_id: params.id })
        .andWhere(knex_1.default.raw("date_trunc('hour', created_at) = date_trunc('hour', ?)", [
        knex_1.default.fn.now()
    ]))
        .first();
    if (visit) {
        await (0, knex_1.default)("visits")
            .where({ id: visit.id })
            .increment(`br_${data.browser}`, 1)
            .increment(`os_${data.os}`, 1)
            .increment("total", 1)
            .update({
            updated_at: new Date().toISOString(),
            countries: knex_1.default.raw("jsonb_set(countries, '{??}', (COALESCE(countries->>?,'0')::int + 1)::text::jsonb)", [data.country, data.country]),
            referrers: knex_1.default.raw("jsonb_set(referrers, '{??}', (COALESCE(referrers->>?,'0')::int + 1)::text::jsonb)", [data.referrer, data.referrer])
        });
    }
    else {
        await (0, knex_1.default)("visits").insert({
            [`br_${data.browser}`]: 1,
            countries: { [data.country]: 1 },
            referrers: { [data.referrer]: 1 },
            [`os_${data.os}`]: 1,
            total: 1,
            link_id: data.id
        });
    }
    return visit;
};
exports.add = add;
const find = async (match, total) => {
    if (match.link_id) {
        const key = redis.key.stats(match.link_id);
        const cached = await redis_1.default.get(key);
        if (cached)
            return JSON.parse(cached);
    }
    const stats = {
        lastDay: {
            stats: utils.getInitStats(),
            views: new Array(24).fill(0)
        },
        lastWeek: {
            stats: utils.getInitStats(),
            views: new Array(7).fill(0)
        },
        lastMonth: {
            stats: utils.getInitStats(),
            views: new Array(30).fill(0)
        },
        allTime: {
            stats: utils.getInitStats(),
            views: new Array(18).fill(0)
        }
    };
    const visitsStream = (0, knex_1.default)("visits").where(match).stream();
    const nowUTC = utils.getUTCDate();
    const now = new Date();
    for await (const visit of visitsStream) {
        utils.STATS_PERIODS.forEach(([days, type]) => {
            const isIncluded = (0, date_fns_1.isAfter)(new Date(visit.created_at), (0, date_fns_1.subDays)(nowUTC, days));
            if (isIncluded) {
                const diffFunction = utils.getDifferenceFunction(type);
                const diff = diffFunction(now, new Date(visit.created_at));
                const index = stats[type].views.length - diff - 1;
                const view = stats[type].views[index];
                const period = stats[type].stats;
                stats[type].stats = {
                    browser: {
                        chrome: period.browser.chrome + visit.br_chrome,
                        edge: period.browser.edge + visit.br_edge,
                        firefox: period.browser.firefox + visit.br_firefox,
                        ie: period.browser.ie + visit.br_ie,
                        opera: period.browser.opera + visit.br_opera,
                        other: period.browser.other + visit.br_other,
                        safari: period.browser.safari + visit.br_safari
                    },
                    os: {
                        android: period.os.android + visit.os_android,
                        ios: period.os.ios + visit.os_ios,
                        linux: period.os.linux + visit.os_linux,
                        macos: period.os.macos + visit.os_macos,
                        other: period.os.other + visit.os_other,
                        windows: period.os.windows + visit.os_windows
                    },
                    country: {
                        ...period.country,
                        ...Object.entries(visit.countries).reduce((obj, [country, count]) => ({
                            ...obj,
                            [country]: (period.country[country] || 0) + count
                        }), {})
                    },
                    referrer: {
                        ...period.referrer,
                        ...Object.entries(visit.referrers).reduce((obj, [referrer, count]) => ({
                            ...obj,
                            [referrer]: (period.referrer[referrer] || 0) + count
                        }), {})
                    }
                };
                stats[type].views[index] = view + visit.total;
            }
        });
        const allTime = stats.allTime.stats;
        const diffFunction = utils.getDifferenceFunction("allTime");
        const diff = diffFunction((0, date_fns_1.set)(new Date(), { date: 1 }), (0, date_fns_1.set)(new Date(visit.created_at), { date: 1 }));
        const index = stats.allTime.views.length - diff - 1;
        const view = stats.allTime.views[index];
        stats.allTime.stats = {
            browser: {
                chrome: allTime.browser.chrome + visit.br_chrome,
                edge: allTime.browser.edge + visit.br_edge,
                firefox: allTime.browser.firefox + visit.br_firefox,
                ie: allTime.browser.ie + visit.br_ie,
                opera: allTime.browser.opera + visit.br_opera,
                other: allTime.browser.other + visit.br_other,
                safari: allTime.browser.safari + visit.br_safari
            },
            os: {
                android: allTime.os.android + visit.os_android,
                ios: allTime.os.ios + visit.os_ios,
                linux: allTime.os.linux + visit.os_linux,
                macos: allTime.os.macos + visit.os_macos,
                other: allTime.os.other + visit.os_other,
                windows: allTime.os.windows + visit.os_windows
            },
            country: {
                ...allTime.country,
                ...Object.entries(visit.countries).reduce((obj, [country, count]) => ({
                    ...obj,
                    [country]: (allTime.country[country] || 0) + count
                }), {})
            },
            referrer: {
                ...allTime.referrer,
                ...Object.entries(visit.referrers).reduce((obj, [referrer, count]) => ({
                    ...obj,
                    [referrer]: (allTime.referrer[referrer] || 0) + count
                }), {})
            }
        };
        stats.allTime.views[index] = view + visit.total;
    }
    const response = {
        allTime: {
            stats: utils.statsObjectToArray(stats.allTime.stats),
            views: stats.allTime.views
        },
        lastDay: {
            stats: utils.statsObjectToArray(stats.lastDay.stats),
            views: stats.lastDay.views
        },
        lastMonth: {
            stats: utils.statsObjectToArray(stats.lastMonth.stats),
            views: stats.lastMonth.views
        },
        lastWeek: {
            stats: utils.statsObjectToArray(stats.lastWeek.stats),
            views: stats.lastWeek.views
        },
        updatedAt: new Date().toISOString()
    };
    if (match.link_id) {
        const cacheTime = utils.getStatsCacheTime(total);
        const key = redis.key.stats(match.link_id);
        redis_1.default.set(key, JSON.stringify(response), "EX", cacheTime);
    }
    return response;
};
exports.find = find;
//# sourceMappingURL=visit.js.map