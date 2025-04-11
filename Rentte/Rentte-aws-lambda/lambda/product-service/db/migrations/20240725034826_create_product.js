
exports.up = function (knex) {
   return knex.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.integer('partnerId').unsigned()
         .notNullable();
      table.text('description');
      table.integer('categoryId').notNullable();
      table.enu('availabilityStatus',['available','unavailable']).defaultTo("unavailable");
      table.string('location');
      table.json('productImages');
      table.uuid('uuid').defaultTo(knex.raw('gen_random_uuid()'));
      table.float('latitude');
      table.float('longitude');
      table.integer('subCategoryId').notNullable();
      table.boolean("status").defaultTo(true);
      table.foreign('partnerId').references('id')
         .inTable('partner')
         .onDelete('CASCADE');
      table.foreign("categoryId").references("id")
         .inTable("category")
         .onDelete("CASCADE");
      table.foreign("subCategoryId").references("id")
         .inTable("subcategory")
         .onDelete("CASCADE");
      table.timestamps(true, true);
   });
};

