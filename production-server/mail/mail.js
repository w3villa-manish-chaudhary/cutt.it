"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordToken = exports.changeEmail = exports.verification = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const text_1 = require("./text");
const utils_1 = require("../utils");
const env_1 = __importDefault(require("../env"));
const mailConfig = {
    host: env_1.default.MAIL_HOST,
    port: env_1.default.MAIL_PORT,
    secure: env_1.default.MAIL_SECURE,
    auth: env_1.default.MAIL_USER
        ? {
            user: env_1.default.MAIL_USER,
            pass: env_1.default.MAIL_PASSWORD
        }
        : undefined
};
const transporter = nodemailer_1.default.createTransport(mailConfig);
exports.default = transporter;
// Read email templates
const resetEmailTemplatePath = path_1.default.join(__dirname, "template-reset.html");
const verifyEmailTemplatePath = path_1.default.join(__dirname, "template-verify.html");
const changeEmailTemplatePath = path_1.default.join(__dirname, "template-change-email.html");
const resetEmailTemplate = fs_1.default
    .readFileSync(resetEmailTemplatePath, { encoding: "utf-8" })
    .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
    .replace(/{{site_name}}/gm, env_1.default.SITE_NAME);
const verifyEmailTemplate = fs_1.default
    .readFileSync(verifyEmailTemplatePath, { encoding: "utf-8" })
    .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
    .replace(/{{site_name}}/gm, env_1.default.SITE_NAME);
const changeEmailTemplate = fs_1.default
    .readFileSync(changeEmailTemplatePath, { encoding: "utf-8" })
    .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
    .replace(/{{site_name}}/gm, env_1.default.SITE_NAME);
const verification = async (user) => {
    const mail = await transporter.sendMail({
        from: env_1.default.MAIL_FROM || env_1.default.MAIL_USER,
        to: user.email,
        subject: "Verify your account",
        text: text_1.verifyMailText
            .replace(/{{verification}}/gim, user.verification_token)
            .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
            .replace(/{{site_name}}/gm, env_1.default.SITE_NAME),
        html: verifyEmailTemplate
            .replace(/{{verification}}/gim, user.verification_token)
            .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
            .replace(/{{site_name}}/gm, env_1.default.SITE_NAME)
    });
    if (!mail.accepted.length) {
        throw new utils_1.CustomError("Couldn't send verification email. Try again later.");
    }
};
exports.verification = verification;
const changeEmail = async (user) => {
    const mail = await transporter.sendMail({
        from: env_1.default.MAIL_FROM || env_1.default.MAIL_USER,
        to: user.change_email_address,
        subject: "Verify your new email address",
        text: text_1.changeEmailText
            .replace(/{{verification}}/gim, user.change_email_token)
            .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
            .replace(/{{site_name}}/gm, env_1.default.SITE_NAME),
        html: changeEmailTemplate
            .replace(/{{verification}}/gim, user.change_email_token)
            .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
            .replace(/{{site_name}}/gm, env_1.default.SITE_NAME)
    });
    if (!mail.accepted.length) {
        throw new utils_1.CustomError("Couldn't send verification email. Try again later.");
    }
};
exports.changeEmail = changeEmail;
const resetPasswordToken = async (user) => {
    const mail = await transporter.sendMail({
        from: env_1.default.MAIL_FROM || env_1.default.MAIL_USER,
        to: user.email,
        subject: "Reset your password",
        text: text_1.resetMailText
            .replace(/{{resetpassword}}/gm, user.reset_password_token)
            .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN),
        html: resetEmailTemplate
            .replace(/{{resetpassword}}/gm, user.reset_password_token)
            .replace(/{{domain}}/gm, env_1.default.DEFAULT_DOMAIN)
    });
    if (!mail.accepted.length) {
        throw new utils_1.CustomError("Couldn't send reset password email. Try again later.");
    }
};
exports.resetPasswordToken = resetPasswordToken;
//# sourceMappingURL=mail.js.map