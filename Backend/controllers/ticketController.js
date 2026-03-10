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

module.exports = { getTickets, getTicket, createTicket };