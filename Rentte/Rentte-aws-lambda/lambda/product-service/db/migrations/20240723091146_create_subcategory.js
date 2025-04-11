
exports.up = function (knex) {
   return knex.schema.createTable('subcategory', (table) => {
      table.increments('id').primary();
      table.integer('categoryId').unsigned()
         .notNullable();
      table.string('subCategoryName').nullable();
      table.foreign('categoryId').references('id')
         .inTable('category')
         .onDelete('CASCADE');
      table.boolean('isDelete').defaultTo(false);
      table.timestamps(true, true); 
   });
};
