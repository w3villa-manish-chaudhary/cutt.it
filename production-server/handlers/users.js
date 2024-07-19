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
exports.remove = exports.get = void 0;
const queries_1 = __importDefault(require("../queries"));
const utils = __importStar(require("../utils"));
const get = async (req, res) => {
    const domains = await queries_1.default.domain.get({ user_id: req.user.id });
    const data = {
        apikey: req.user.apikey,
        email: req.user.email,
        domains: domains.map(utils.sanitize.domain)
    };
    return res.status(200).send(data);
};
exports.get = get;
const remove = async (req, res) => {
    await queries_1.default.user.remove(req.user);
    return res.status(200).send("OK");
};
exports.remove = remove;
//# sourceMappingURL=users.js.map