const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MariaDB',
  database: 'otdbackend',
  connectionLimit: 5
});

module.exports = pool;