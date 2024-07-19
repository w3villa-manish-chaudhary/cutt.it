"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    const hasChangeEmail = await knex.schema.hasColumn("users", "change_email_token");
    if (!hasChangeEmail) {
        await knex.schema.alterTable("users", table => {
            table.dateTime("change_email_expires");
            table.string("change_email_token");
            table.string("change_email_address");
        });
    }
}
exports.up = up;
async function down() {
    return null;
}
exports.down = down;
//# sourceMappingURL=20200810195255_change_email.js.map