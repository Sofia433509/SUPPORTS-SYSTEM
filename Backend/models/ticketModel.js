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

const updateTicket = async (id, updates) => {
  try {
    const allowedFields = [
      'title',
      'description',
      'status',
      'user_id',
      'desk_id',
      'priority',
      'category',
      'createdByName',
      'assignedTo',
      'assignedToName',
      'location'
    ];

    const setClauses = [];
    const values = [];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    // Always update updatedAt
    setClauses.push('updatedAt = ?');
    values.push(new Date());

    if (!setClauses.length) {
      throw new Error('No se proporcionaron campos para actualizar');
    }

    values.push(id);

    const query = `UPDATE tickets SET ${setClauses.join(', ')} WHERE id = ?`;
    return await pool.query(query, values);
  } catch (err) {
    throw err;
  }
};

const deleteTicket = async (id) => {
  try {
    return await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
  } catch (err) {
    throw err;
  }
};

module.exports = { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket };