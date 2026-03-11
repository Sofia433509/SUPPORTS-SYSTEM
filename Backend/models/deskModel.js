// Modelo de escritorio para MariaDB
const pool = require('../db');

const getAllDesks = async () => {
  try {
    const rows = await pool.query('SELECT * FROM desks');
    return rows;
  } catch (err) {
    throw err;
  }
};

const getDeskById = async (id) => {
  try {
    const rows = await pool.query('SELECT * FROM desks WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

const createDesk = async (desk) => {
  try {
    const { name, location, status } = desk;
    // Evitar duplicados por nombre
    const existing = await pool.query('SELECT id FROM desks WHERE name = ?', [name]);
    if (existing.length) {
      return existing[0];
    }
    const result = await pool.query('INSERT INTO desks (name, location, status) VALUES (?, ?, ?)', [name, location, status]);
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = { getAllDesks, getDeskById, createDesk };