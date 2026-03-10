// Modelo de ticket para MariaDB
const pool = require('../db');

const getAllTickets = async () => {
  try {
    const rows = await pool.query('SELECT * FROM tickets');
    return rows;
  } catch (err) {
    throw err;
  }
};

const getTicketById = async (id) => {
  try {
    const rows = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    return rows[0];
  } catch (err) {
    throw err;
  }
};

const createTicket = async (ticket) => {
  try {
    const {
      title,
      description,
      status,
      user_id,
      desk_id,
      priority,
      category,
      createdByName,
      assignedTo,
      assignedToName,
      location
    } = ticket;
    const createdAt = new Date();
    const updatedAt = new Date();
    const result = await pool.query(
      'INSERT INTO tickets (title, description, status, user_id, desk_id, priority, category, createdByName, assignedTo, assignedToName, location, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, status, user_id, desk_id, priority, category, createdByName, assignedTo, assignedToName, location, createdAt, updatedAt]
    );
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = { getAllTickets, getTicketById, createTicket };