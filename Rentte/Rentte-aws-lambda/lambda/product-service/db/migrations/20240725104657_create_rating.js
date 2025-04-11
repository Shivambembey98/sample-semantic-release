
exports.up = function (knex) {
   return knex.schema.createTable("rating",(table) => {
      table.increments('id').primary();
      table.integer("productId").unsigned()
         .notNullable();
      table.integer("userId").unsigned()
         .notNullable();
      table.integer("rating").notNullable();
      table.text("comments");
      table.foreign("productId").references("id")
         .inTable("products")
         .onDelete('CASCADE');
      table.foreign("userId").references("id")
         .inTable("users")
         .onDelete("CASCADE");
      table.timestamps(true, true);
   });
};

