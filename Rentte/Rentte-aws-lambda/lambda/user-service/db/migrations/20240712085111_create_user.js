exports.up = function (knex) {
   return knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('firstName');
      table.string('lastName');
      table.string('email').unique();
      table.bigInteger('mobileNumber').unique();
      table.string("countryCode");
      table.string('password');
      table.string('gender');
      table.string('profession');
      table.date('dob');
      table.bigInteger("status").defaultTo(1);
      table.enu('userType', ['admin', 'user', 'partner']).defaultTo('user');
      table.timestamps(true, true);
   });
};


exports.down = function (knex) {
   return knex.schema.dropTable('users');
};
