
const { DB_USER, DB_HOST, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
const fs = require('fs');
const path = require('path');
// Correctly resolve the path to the PEM file
const pemFilePath = path.resolve(__dirname, '../ap-south-1-bundle.pem');
module.exports = {
   development: {
      client: 'postgresql',
      connection: {
         database: DB_NAME,
         user: DB_USER,
         password: DB_PASSWORD,
         host: DB_HOST,
         port: DB_PORT,
         ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(pemFilePath).toString(),
         },
      },
      pool: {
         min: 2,
         max: 10,
      },
      migrations: {
         tableName: 'knex_user_migrations',
      },
   },
};
