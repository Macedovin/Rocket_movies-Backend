
exports.up = knex => knex.schema.alterTable("movie_notes", table => {
  table.text("title").notNullable().alter();
  table.integer("user_id").references("id").inTable("users").onDelete("CASCADE").alter();
});

exports.down = knex => knex.schema.alterTable("movie_notes", table => {
  table.dropColumn("title");
  table.dropColumn("user_id");
});
