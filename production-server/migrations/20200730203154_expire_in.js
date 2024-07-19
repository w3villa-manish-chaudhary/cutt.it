"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    const hasExpireIn = await knex.schema.hasColumn("links", "expire_in");
    if (!hasExpireIn) {
        await knex.schema.alterTable("links", table => {
            table.dateTime("expire_in");
        });
    }
}
exports.up = up;
async function down() {
    return null;
}
exports.down = down;
//# sourceMappingURL=20200730203154_expire_in.js.map