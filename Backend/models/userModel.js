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

// Recuperación de contraseña
const saveRecoveryCode = async (email, code) => {
  // Busca usuario por email
  const rows = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (!rows.length) throw new Error('Usuario no encontrado');
  const userId = rows[0].id;
  // Guarda código y timestamp
  await pool.query('INSERT INTO password_recovery (user_id, code, created_at) VALUES (?, ?, NOW())', [userId, code]);
};

const verifyRecoveryCode = async (email, code) => {
  const rows = await pool.query(
    'SELECT pr.id FROM password_recovery pr JOIN users u ON pr.user_id = u.id WHERE u.email = ? AND pr.code = ? AND pr.created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)',
    [email, code]
  );
  return rows.length > 0;
};

const deleteRecoveryCodes = async (email) => {
  const rows = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (!rows.length) return;
  const userId = rows[0].id;
  await pool.query('DELETE FROM password_recovery WHERE user_id = ?', [userId]);
};

const updatePassword = async (email, newPassword) => {
  await pool.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
};

module.exports.saveRecoveryCode = saveRecoveryCode;
module.exports.verifyRecoveryCode = verifyRecoveryCode;
module.exports.deleteRecoveryCodes = deleteRecoveryCodes;
module.exports.updatePassword = updatePassword;