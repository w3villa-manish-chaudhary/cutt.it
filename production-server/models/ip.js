"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIPTable = void 0;
async function createIPTable(knex) {
    const hasTable = await knex.schema.hasTable("ips");
    if (!hasTable) {
        await knex.schema.createTable("ips", table => {
            table.increments("id").primary();
            table
                .string("ip")
                .unique()
                .notNullable();
            table.timestamps(false, true);
        });
    }
}
exports.createIPTable = createIPTable;
//# sourceMappingURL=ip.js.map