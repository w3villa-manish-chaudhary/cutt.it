"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    const hasDescription = await knex.schema.hasColumn("links", "description");
    if (!hasDescription) {
        await knex.schema.alterTable("links", table => {
            table.string("description");
        });
    }
}
exports.up = up;
async function down() {
    return null;
}
exports.down = down;
//# sourceMappingURL=20200718124944_description.js.map