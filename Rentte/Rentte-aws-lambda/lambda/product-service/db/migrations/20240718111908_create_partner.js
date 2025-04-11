
exports.up = function (knex) {
   return knex.schema.createTable('partner', (table) => {
      table.increments('id').primary();
      table.integer('userid').unsigned()
         .notNullable();
      table.bigInteger('productCount').defaultTo(0);
      table.foreign('userid').references('id')
         .inTable('users')
         .onDelete('CASCADE');
      table.timestamps(true, true); 
   });
};

