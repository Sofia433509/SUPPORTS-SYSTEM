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
    const result = await ticketModel.createTicket(req.body);
    res.status(201).json({ message: 'Ticket creado', result });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ticket' });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await ticketModel.updateTicket(id, updates);
    res.json({ message: 'Ticket actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ticket' });
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