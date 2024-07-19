"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const queries_1 = __importDefault(require("./queries"));
const env_1 = __importDefault(require("./env"));
if (env_1.default.NON_USER_COOLDOWN) {
    node_cron_1.default.schedule("* */24 * * *", () => {
        queries_1.default.ip.clear().catch();
    });
}
node_cron_1.default.schedule("*/15 * * * * *", () => {
    queries_1.default.link
        .batchRemove({ expire_in: ["<", new Date().toISOString()] })
        .catch();
});
//# sourceMappingURL=cron.js.map