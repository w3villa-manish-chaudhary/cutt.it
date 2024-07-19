"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const useragent_1 = __importDefault(require("useragent"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const url_1 = __importDefault(require("url"));
const queries_1 = __importDefault(require("../queries"));
const utils_1 = require("../utils");
const browsersList = ["IE", "Firefox", "Chrome", "Opera", "Safari", "Edge"];
const osList = ["Windows", "Mac OS", "Linux", "Android", "iOS"];
const filterInBrowser = (agent) => (item) => agent.family.toLowerCase().includes(item.toLocaleLowerCase());
const filterInOs = (agent) => (item) => agent.os.family.toLowerCase().includes(item.toLocaleLowerCase());
function visit({ data }) {
    const tasks = [];
    tasks.push(queries_1.default.link.incrementVisit({ id: data.link.id }));
    if (data.link.visit_count < (0, utils_1.getStatsLimit)()) {
        const agent = useragent_1.default.parse(data.headers["user-agent"]);
        const [browser = "Other"] = browsersList.filter(filterInBrowser(agent));
        const [os = "Other"] = osList.filter(filterInOs(agent));
        const referrer = data.referrer && (0, utils_1.removeWww)(url_1.default.parse(data.referrer).hostname);
        const location = geoip_lite_1.default.lookup(data.realIP);
        const country = location && location.country;
        tasks.push(queries_1.default.visit.add({
            browser: browser.toLowerCase(),
            country: country || "Unknown",
            id: data.link.id,
            os: os.toLowerCase().replace(/\s/gi, ""),
            referrer: (referrer && referrer.replace(/\./gi, "[dot]")) || "Direct"
        }));
    }
    return Promise.all(tasks);
}
exports.default = visit;
//# sourceMappingURL=visit.js.map