
exports.up = function (knex) {
   return knex.schema.createTable('userOtp', (table) => {
      table.increments('id').primary();
      table.string('email');
      table.string("countryCode");
      table.bigInteger("mobile").notNullable();
      table.bigInteger("otp").notNullable();
      table.boolean('isVerify').defaultTo(false);
      table.string("otpType").notNullable();
      table.timestamps(true, true);
   });
};

exports.down = function () {

};
