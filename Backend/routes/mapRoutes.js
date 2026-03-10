const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Guardar mapa
router.post('/save', mapController.saveMap);
// Editar mapa
router.put('/edit', mapController.editMap);
// Ver mapa
router.get('/view', mapController.viewMap);
// Listar headquarters y floors
router.get('/options', mapController.getOptions);

module.exports = router;
