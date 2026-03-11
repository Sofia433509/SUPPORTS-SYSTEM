const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/register', userController.createUser);

// Recuperación de contraseña
router.post('/request-recovery', userController.requestPasswordRecovery);
router.post('/verify-code', userController.verifyRecoveryCode);
router.post('/reset-password', userController.resetPassword);

const authController = require('../controllers/authController');
router.post('/login', authController.login);

module.exports = router;