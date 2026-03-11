const ticketModel = require('../models/ticketModel');

const getTickets = async (req, res) => {
  try {
    const tickets = await ticketModel.getAllTickets();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};

const getTicket = async (req, res) => {
  try {
    const ticket = await ticketModel.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};

const createTicket = async (req, res) => {
  try {
    console.log('Creating ticket with payload:', req.body);
    const result = await ticketModel.createTicket(req.body);
    // after insertion, escalate if location threshold reached
    if (req.body.location) {
      try {
        await ticketModel.escalateLocationIfNeeded(req.body.location);
      } catch (e) {
        console.error('Error escalating location after create', e);
      }
    }

    const insertId = typeof result?.insertId === 'bigint' ? result.insertId.toString() : result?.insertId;
    res.status(201).json({ message: 'Ticket creado', insertId });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Error al crear ticket', details: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log(`Updating ticket ${id} with:`, updates);
    await ticketModel.updateTicket(id, updates);
    // if location was changed or new urgent status might be needed
    if (updates.location) {
      try {
        await ticketModel.escalateLocationIfNeeded(updates.location);
      } catch (e) {
        console.error('Error escalating location after update', e);
      }
    }
    res.json({ message: 'Ticket actualizado' });
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Error al actualizar ticket', details: err.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    await ticketModel.deleteTicket(id);
    res.json({ message: 'Ticket eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
};

module.exports = { getTickets, getTicket, createTicket, updateTicket, deleteTicket };