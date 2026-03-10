const express = require('express');
const router = express.Router();
const deskController = require('../controllers/deskController');

router.get('/', deskController.getDesks);
router.get('/:id', deskController.getDesk);
router.post('/', deskController.createDesk);

module.exports = router;