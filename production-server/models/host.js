"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHostTable = void 0;
async function createHostTable(knex) {
    const hasTable = await knex.schema.hasTable("hosts");
    if (!hasTable) {
        await knex.schema.createTable("hosts", table => {
            table.increments("id").primary();
            table
                .string("address")
                .unique()
                .notNullable();
            table
                .boolean("banned")
                .notNullable()
                .defaultTo(false);
            table
                .integer("banned_by_id")
                .references("id")
                .inTable("users");
            table.timestamps(false, true);
        });
    }
}
exports.createHostTable = createHostTable;
//# sourceMappingURL=host.js.map