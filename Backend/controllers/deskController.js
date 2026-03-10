const deskModel = require('../models/deskModel');

const getDesks = async (req, res) => {
  try {
    const desks = await deskModel.getAllDesks();
    res.json(desks);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener escritorios' });
  }
};

const getDesk = async (req, res) => {
  try {
    const desk = await deskModel.getDeskById(req.params.id);
    if (!desk) return res.status(404).json({ error: 'Escritorio no encontrado' });
    res.json(desk);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener escritorio' });
  }
};

const createDesk = async (req, res) => {
  try {
    const result = await deskModel.createDesk(req.body);
    res.status(201).json({ message: 'Escritorio creado', result });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear escritorio' });
  }
};

module.exports = { getDesks, getDesk, createDesk };