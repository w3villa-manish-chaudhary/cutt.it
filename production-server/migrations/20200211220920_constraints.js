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
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const models = __importStar(require("../models"));
async function up(knex) {
    await models.createUserTable(knex);
    await models.createIPTable(knex);
    await models.createDomainTable(knex);
    await models.createHostTable(knex);
    await models.createLinkTable(knex);
    await models.createVisitTable(knex);
    await Promise.all([
        knex.raw(`
      ALTER TABLE domains
      DROP CONSTRAINT domains_user_id_foreign,
      ADD CONSTRAINT domains_user_id_foreign
        FOREIGN KEY (user_id) 
        REFERENCES users (id)
        ON DELETE SET NULL;
    `),
        knex.raw(`
      ALTER TABLE links
      DROP CONSTRAINT links_user_id_foreign,
      ADD CONSTRAINT links_user_id_foreign
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE;
    `),
        knex.raw(`
      ALTER TABLE visits
      DROP CONSTRAINT visits_link_id_foreign,
      ADD CONSTRAINT visits_link_id_foreign
        FOREIGN KEY (link_Id)
        REFERENCES links (id)
        ON DELETE CASCADE;
    `)
    ]);
}
exports.up = up;
async function down() {
    // do nothing
}
exports.down = down;
//# sourceMappingURL=20200211220920_constraints.js.map