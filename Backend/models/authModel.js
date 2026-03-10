const pool = require('../db');

const getUserByEmail = async (email) => {
  try {
    const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = { getUserByEmail };
