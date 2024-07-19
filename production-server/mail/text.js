"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetMailText = exports.changeEmailText = exports.verifyMailText = void 0;
/* eslint-disable max-len */
exports.verifyMailText = `You're attempting to change your email address on {{site_name}}.

Please verify your email address using the link below.

https://{{domain}}/verify/{{verification}}`;
exports.changeEmailText = `Thanks for creating an account on {{site_name}}.

Please verify your email address using the link below.

https://{{domain}}/verify-email/{{verification}}`;
exports.resetMailText = `A password reset has been requested for your account.

Please click on the button below to reset your password. There's no need to take any action if you didn't request this.

https://{{domain}}/reset-password/{{resetpassword}}`;
//# sourceMappingURL=text.js.map