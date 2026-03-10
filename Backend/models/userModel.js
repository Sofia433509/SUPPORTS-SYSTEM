// Modelo de usuario para MariaDB
const pool = require('../db');

const getAllUsers = async () => {
  try {
    const rows = await pool.query('SELECT * FROM users');
    return rows;
  } catch (err) {
    throw err;
  }
};

const getUserById = async (id) => {
  try {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

const createUser = async (user) => {
  try {
    // Adaptar campos del frontend
    const name = user.full_name || user.name;
    const email = user.institutional_email || user.email;
    const password = user.password;
    const role = user.campaign || user.role || 'Employees';
    const result = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = { getAllUsers, getUserById, createUser };