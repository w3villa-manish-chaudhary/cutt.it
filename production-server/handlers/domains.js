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
exports.remove = exports.add = void 0;
const queries_1 = __importDefault(require("../queries"));
const redis = __importStar(require("../redis"));
const utils_1 = require("../utils");
const add = async (req, res) => {
    const { address, homepage } = req.body;
    const domain = await queries_1.default.domain.add({
        address,
        homepage,
        user_id: req.user.id
    });
    return res.status(200).send(utils_1.sanitize.domain(domain));
};
exports.add = add;
const remove = async (req, res) => {
    const [domain] = await queries_1.default.domain.update({
        uuid: req.params.id,
        user_id: req.user.id
    }, { user_id: null });
    redis.remove.domain(domain);
    if (!domain) {
        throw new utils_1.CustomError("Could not delete the domain.", 500);
    }
    return res.status(200).send({ message: "Domain deleted successfully" });
};
exports.remove = remove;
//# sourceMappingURL=domains.js.map