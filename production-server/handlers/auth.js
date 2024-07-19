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
exports.kivoCallback = exports.kivoSignIn = exports.changeEmail = exports.changeEmailRequest = exports.signupAccess = exports.resetPassword = exports.resetPasswordRequest = exports.generateApiKey = exports.changePassword = exports.verify = exports.token = exports.signup = exports.admin = exports.recaptcha = exports.cooldown = exports.apikey = exports.jwtLoose = exports.jwt = exports.local = void 0;
const date_fns_1 = require("date-fns");
const passport_1 = __importDefault(require("passport"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nanoid_1 = __importDefault(require("nanoid"));
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
const utils = __importStar(require("../utils"));
const redis = __importStar(require("../redis"));
const mail = __importStar(require("../mail"));
const queries_1 = __importDefault(require("../queries"));
const env_1 = __importDefault(require("../env"));
const simple_oauth2_1 = require("simple-oauth2");
const helpers_1 = require("./helpers");
const authenticate = (type, error, isStrict = true) => async function auth(req, res, next) {
    if (req.user)
        return next();
    passport_1.default.authenticate(type, (err, user) => {
        if (err)
            return next(err);
        if (!user && isStrict) {
            throw new utils_1.CustomError(error, 401);
        }
        if (user && isStrict && !user.verified) {
            throw new utils_1.CustomError("Your email address is not verified. " +
                "Click on signup to get the verification link again.", 400);
        }
        if (user && user.banned) {
            throw new utils_1.CustomError("You're banned from using this website.", 403);
        }
        if (user) {
            req.user = {
                ...user,
                admin: utils.isAdmin(user.email)
            };
            return next();
        }
        return next();
    })(req, res, next);
};
exports.local = authenticate("local", "Login credentials are wrong.");
exports.jwt = authenticate("jwt", "Unauthorized.");
exports.jwtLoose = authenticate("jwt", "Unauthorized.", false);
exports.apikey = authenticate("localapikey", "API key is not correct.", false);
const cooldown = async (req, res, next) => {
    if (env_1.default.DISALLOW_ANONYMOUS_LINKS)
        return next();
    const cooldownConfig = env_1.default.NON_USER_COOLDOWN;
    if (req.user || !cooldownConfig)
        return next();
    const ip = await queries_1.default.ip.find({
        ip: req.realIP.toLowerCase(),
        created_at: [">", (0, date_fns_1.subMinutes)(new Date(), cooldownConfig).toISOString()]
    });
    if (ip) {
        const timeToWait = cooldownConfig - (0, date_fns_1.differenceInMinutes)(new Date(), new Date(ip.created_at));
        throw new utils_1.CustomError(`Non-logged in users are limited. Wait ${timeToWait} minutes or log in.`, 400);
    }
    next();
};
exports.cooldown = cooldown;
const recaptcha = async (req, res, next) => {
    if (env_1.default.isDev || req.user)
        return next();
    if (env_1.default.DISALLOW_ANONYMOUS_LINKS)
        return next();
    if (!env_1.default.RECAPTCHA_SECRET_KEY)
        return next();
    const isReCaptchaValid = await (0, axios_1.default)({
        method: "post",
        url: "https://www.google.com/recaptcha/api/siteverify",
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        },
        params: {
            secret: env_1.default.RECAPTCHA_SECRET_KEY,
            response: req.body.reCaptchaToken,
            remoteip: req.realIP
        }
    });
    if (!isReCaptchaValid.data.success) {
        throw new utils_1.CustomError("reCAPTCHA is not valid. Try again.", 401);
    }
    return next();
};
exports.recaptcha = recaptcha;
const admin = async (req, res, next) => {
    if (req.user.admin)
        return next();
    throw new utils_1.CustomError("Unauthorized", 401);
};
exports.admin = admin;
const signup = async (req, res) => {
    const salt = await bcryptjs_1.default.genSalt(12);
    const password = await bcryptjs_1.default.hash(req.body.password, salt);
    const user = await queries_1.default.user.add({ email: req.body.email, password }, req.user);
    await mail.verification(user);
    return res.status(201).send({ message: "Verification email has been sent." });
};
exports.signup = signup;
const token = async (req, res) => {
    const token = utils.signToken(req.user);
    return res.status(200).send({ token });
};
exports.token = token;
const verify = async (req, res, next) => {
    if (!req.params.verificationToken)
        return next();
    const [user] = await queries_1.default.user.update({
        verification_token: req.params.verificationToken,
        verification_expires: [">", new Date().toISOString()]
    }, {
        verified: true,
        verification_token: null,
        verification_expires: null
    });
    if (user) {
        const token = utils.signToken(user);
        req.token = token;
    }
    return next();
};
exports.verify = verify;
const changePassword = async (req, res) => {
    const salt = await bcryptjs_1.default.genSalt(12);
    const password = await bcryptjs_1.default.hash(req.body.password, salt);
    const [user] = await queries_1.default.user.update({ id: req.user.id }, { password });
    if (!user) {
        throw new utils_1.CustomError("Couldn't change the password. Try again later.");
    }
    return res
        .status(200)
        .send({ message: "Your password has been changed successfully." });
};
exports.changePassword = changePassword;
const generateApiKey = async (req, res) => {
    const apikey = (0, nanoid_1.default)(40);
    redis.remove.user(req.user);
    const [user] = await queries_1.default.user.update({ id: req.user.id }, { apikey });
    if (!user) {
        throw new utils_1.CustomError("Couldn't generate API key. Please try again later.");
    }
    return res.status(201).send({ apikey });
};
exports.generateApiKey = generateApiKey;
const resetPasswordRequest = async (req, res) => {
    const [user] = await queries_1.default.user.update({ email: req.body.email }, {
        reset_password_token: (0, uuid_1.v4)(),
        reset_password_expires: (0, date_fns_1.addMinutes)(new Date(), 30).toISOString()
    });
    if (user) {
        await mail.resetPasswordToken(user);
    }
    return res.status(200).send({
        message: "If email address exists, a reset password email has been sent."
    });
};
exports.resetPasswordRequest = resetPasswordRequest;
const resetPassword = async (req, res, next) => {
    const { resetPasswordToken } = req.params;
    if (resetPasswordToken) {
        const [user] = await queries_1.default.user.update({
            reset_password_token: resetPasswordToken,
            reset_password_expires: [">", new Date().toISOString()]
        }, { reset_password_expires: null, reset_password_token: null });
        if (user) {
            const token = utils.signToken(user);
            req.token = token;
        }
    }
    return next();
};
exports.resetPassword = resetPassword;
const signupAccess = (req, res, next) => {
    if (!env_1.default.DISALLOW_REGISTRATION)
        return next();
    return res.status(403).send({ message: "Registration is not allowed." });
};
exports.signupAccess = signupAccess;
const changeEmailRequest = async (req, res) => {
    const { email, password } = req.body;
    const isMatch = await bcryptjs_1.default.compare(password, req.user.password);
    if (!isMatch) {
        throw new utils_1.CustomError("Password is wrong.", 400);
    }
    const currentUser = await queries_1.default.user.find({ email });
    if (currentUser) {
        throw new utils_1.CustomError("Can't use this email address.", 400);
    }
    const [updatedUser] = await queries_1.default.user.update({ id: req.user.id }, {
        change_email_address: email,
        change_email_token: (0, uuid_1.v4)(),
        change_email_expires: (0, date_fns_1.addMinutes)(new Date(), 30).toISOString()
    });
    redis.remove.user(updatedUser);
    if (updatedUser) {
        await mail.changeEmail({ ...updatedUser, email });
    }
    return res.status(200).send({
        message: "If email address exists, an email " +
            "with a verification link has been sent."
    });
};
exports.changeEmailRequest = changeEmailRequest;
const changeEmail = async (req, res, next) => {
    const { changeEmailToken } = req.params;
    if (changeEmailToken) {
        const foundUser = await queries_1.default.user.find({
            change_email_token: changeEmailToken
        });
        if (!foundUser)
            return next();
        const [user] = await queries_1.default.user.update({
            change_email_token: changeEmailToken,
            change_email_expires: [">", new Date().toISOString()]
        }, {
            change_email_token: null,
            change_email_expires: null,
            change_email_address: null,
            email: foundUser.change_email_address
        });
        redis.remove.user(foundUser);
        if (user) {
            const token = utils.signToken(user);
            req.token = token;
        }
    }
    return next();
};
exports.changeEmail = changeEmail;
const kivoSignIn = async (req, res, next) => {
    try {
        const kivoConfig = (0, helpers_1.getKivoConfig)();
        const client = new simple_oauth2_1.AuthorizationCode({
            client: {
                id: kivoConfig.KIVO_CLIENT_ID,
                secret: kivoConfig.KIVO_CLIENT_SECRET,
            },
            auth: {
                tokenHost: kivoConfig.KIVO_PROVIDER_URL,
                authorizePath: kivoConfig.KIVO_AUTHORIZE_PATH,
            },
        });
        const authorizationUri = client.authorizeURL({
            redirect_uri: kivoConfig.KIVO_CALLBACK_URL,
            scope: kivoConfig.KIVO_SCOPE,
        });
        res.redirect(authorizationUri);
    }
    catch (error) {
        next(error);
    }
};
exports.kivoSignIn = kivoSignIn;
const kivoCallback = async (req, res, next) => {
    try {
        const code = req.query.code;
        const kivoConfig = (0, helpers_1.getKivoConfig)();
        const client = new simple_oauth2_1.AuthorizationCode({
            client: {
                id: kivoConfig.KIVO_CLIENT_ID,
                secret: kivoConfig.KIVO_CLIENT_SECRET,
            },
            auth: {
                tokenHost: kivoConfig.KIVO_PROVIDER_URL,
                // tokenPath: kivoConfig.KIVO_TOKEN_PATH,
            },
        });
        const tokenParams = {
            code,
            redirect_uri: kivoConfig.KIVO_CALLBACK_URL,
        };
        const accessToken = await client.getToken(tokenParams);
        const userResponse = await axios_1.default.get(`${kivoConfig.KIVO_PROVIDER_URL}/api/v1/users/me.json`, {
            headers: {
                Authorization: `Bearer ${accessToken.token.access_token}`,
            },
        });
        const rawInfo = userResponse.data;
        const kivo_user = {
            firstName: rawInfo.current_profile.first_name,
            email: rawInfo.current_profile.email,
            timeZone: rawInfo.current_profile.time_zone,
            kivo_id: rawInfo.current_profile.id,
            refresh_token: accessToken.token.refresh_token,
            access_token: accessToken.token.access_token,
        };
        return res.status(200).json({
            data: kivo_user,
            message: "Signed in successfully",
        });
    }
    catch (error) {
        console.error("Error in auth:kivoCallback service function", error);
        next(error);
    }
};
exports.kivoCallback = kivoCallback;
//# sourceMappingURL=auth.js.map