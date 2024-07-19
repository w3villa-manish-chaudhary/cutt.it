"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_localapikey_update_1 = require("passport-localapikey-update");
const passport_jwt_1 = require("passport-jwt");
const passport_local_1 = require("passport-local");
const passport_1 = __importDefault(require("passport"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const queries_1 = __importDefault(require("./queries"));
const env_1 = __importDefault(require("./env"));
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromHeader("authorization"),
    secretOrKey: env_1.default.JWT_SECRET
};
passport_1.default.use(new passport_jwt_1.Strategy(jwtOptions, async (payload, done) => {
    try {
        const user = await queries_1.default.user.find({ email: payload.sub });
        if (!user)
            return done(null, false);
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
const localOptions = {
    usernameField: "email"
};
passport_1.default.use(new passport_local_1.Strategy(localOptions, async (email, password, done) => {
    try {
        const user = await queries_1.default.user.find({ email });
        if (!user) {
            return done(null, false);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
const localAPIKeyOptions = {
    apiKeyField: "apikey",
    apiKeyHeader: "x-api-key"
};
passport_1.default.use(new passport_localapikey_update_1.Strategy(localAPIKeyOptions, async (apikey, done) => {
    try {
        const user = await queries_1.default.user.find({ apikey });
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
//# sourceMappingURL=passport.js.map