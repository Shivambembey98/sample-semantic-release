exports.up = function (knex) {
   return knex.schema.createTable('category', (table) => {
      table.increments('id').primary(); 
      table.string('categoryName').notNullable();
      table.text('description').nullable();
      table.boolean('isDelete').defaultTo(false);
      table.timestamps(true, true); 
   });
};
  
exports.down = function (knex) {
   return knex.schema.dropTable('category');
};
  
